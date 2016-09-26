/*
 * Car Physics Demo
 * version 0.8 3-06-2001
 *
 * Copyright (c) 2001 Monstrous Software
 *
 * Platforms: Allegro/DJGPP, Allegro/Linux, Allegro/MSVC
 *
 * Demonstrates rough approximation of car physics.
 *
 */

#include <stdio.h>
#include <math.h>
#include <string.h>

#include "allegro.h"



/* Defines
 */
#define TRAIL_SIZE		200			/* number of dots in car trail */
#define DELTA_T			0.01		/* time between integration steps in physics modelling */
#define	INPUT_DELTA_T	0.1			/* delay between keyboard polls */

#ifndef M_PI						/* if not in math.h, i.e. MSVC */
# define M_PI 3.1415926
#endif


/* Typedefs
 */


typedef struct VEC2
{
	float 	x,y;
} VEC2;


typedef struct CARTYPE
{
	float	wheelbase;		// wheelbase in m
	float	b;				// in m, distance from CG to front axle
	float	c;				// in m, idem to rear axle
	float	h;				// in m, height of CM from ground
	float	mass;			// in kg
	float	inertia;		// in kg.m
	float	length,width;
	float	wheellength,wheelwidth;
} CARTYPE;

typedef struct CAR
{
	CARTYPE	*cartype;			// pointer to static car data
	
	VEC2	position_wc;		// position of car centre in world coordinates
	VEC2	velocity_wc;		// velocity vector of car in world coordinates

	float	angle;				// angle of car body orientation (in rads)
	float	angularvelocity;

	float	steerangle;			// angle of steering (input)
	float	throttle;			// amount of throttle (input)
	float	brake;				// amount of braking (input)
} CAR;

typedef struct TRAILPOINT
{
	float	x,y;
	float	angle;
} TRAILPOINT;

/* Globals
 */

CARTYPE			cartypes[1];
VEC2			screen_pos;
float			scale;
char			str[80];
volatile int 	ticks = 1;			// ticks of DELTA_T second
volatile int 	iticks = 1;			// ticks of INPUT_DELTA_T second
TRAILPOINT		trail[ TRAIL_SIZE ];
int				num_trail = 0;



/* Lots of globals, so their value may be printed on screen
 * normally most of these variables should be private to the physics function.
 */
	VEC2	velocity;
	VEC2	acceleration_wc;
	double	rot_angle;
	double	sideslip;
	double	slipanglefront;
	double	slipanglerear;
	VEC2	force;
	int		rear_slip;
	int		front_slip;
	VEC2	resistance;
	VEC2	acceleration;
	double	torque;
	double	angular_acceleration;
	double	sn, cs;
	double	yawspeed;
	double	weight;
	VEC2	ftraction;
	VEC2	flatf, flatr;

/* Functions
 */

void ticks_timer( void )
{
	ticks++;
}
END_OF_FUNCTION(ticks_timer);



void iticks_timer( void )
{
	iticks++;
}
END_OF_FUNCTION(iticks_timer);


/*
 * Trail module
 */


void init_trail( void )
{
		num_trail = 0;
};


void draw_trail( BITMAP *buffer, CAR *car )
{
	int		col;
	int		i;
	int		x,y;

	col = makecol(230,230,230);

	for(i = 0; i < num_trail; i++)
	{
		x =  (trail[i].x-car->position_wc.x)*scale+screen_pos.x;
		y = -(trail[i].y-car->position_wc.y)*scale+screen_pos.y;
		circle(buffer, x, y, 2, col);
	}
}

void add_to_trail( float x, float y, float angle)
{

	if( num_trail < TRAIL_SIZE-1 )
	{
		trail[num_trail].x = x;
		trail[num_trail].y = y;
		trail[num_trail].angle = angle;
		num_trail++;
	}
	else
	{
		memcpy( trail+0, trail+1, sizeof(trail[0])*(TRAIL_SIZE-1));
		trail[num_trail].x = x;
		trail[num_trail].y = y;
		trail[num_trail].angle = angle;
	}
}


/*
 * End of Trail module
 */

/*
 * Render module
 */

void draw_rect( BITMAP *buffer, float angle, int w, int l, int x, int y, int col, int crossed)
{
	VEC2	c[4];
	VEC2	c2[4];
	float	sn, cs;
	int		i;

    sn = sin(angle);
    cs = cos(angle);

    c[0].x = -w/2;
    c[0].y = l/2;

    c[1].x = w/2;
    c[1].y = l/2;

    c[2].x = w/2;
    c[2].y = -l/2;

    c[3].x = -w/2;
    c[3].y = -l/2;

	for(i = 0; i <= 3; i++)
	{
		c2[i].x = cs*c[i].x - sn*c[i].y;
		c2[i].y = sn*c[i].x + cs*c[i].y;
		c[i].x = c2[i].x;
		c[i].y = c2[i].y;
	}

	for(i = 0; i <= 3; i++)
	{
		c[i].x += x;
		c[i].y += y;
	}
	line(buffer, c[0].x, c[0].y, c[1].x, c[1].y, col);
	line(buffer, c[1].x, c[1].y, c[2].x, c[2].y, col);
	line(buffer, c[2].x, c[2].y, c[3].x, c[3].y, col);
	line(buffer, c[3].x, c[3].y, c[0].x, c[0].y, col);

	if(crossed)
	{
		line(buffer, c[0].x, c[0].y, c[2].x, c[2].y, col);
		line(buffer, c[1].x, c[1].y, c[3].x, c[3].y, col);
	}
}


void draw_wheel( int nr, BITMAP *buffer, CAR *car, int x, int y, int crossed)
{
	int		col;

	col = makecol(0,160,0);

	draw_rect(buffer, car->angle+(nr<2 ? car->steerangle : 0),
		car->cartype->wheelwidth*scale, car->cartype->wheellength*scale, x, y, col, crossed );
}

void render( BITMAP *buffer, CAR *car)
{
	int		col;
	VEC2	corners[4];
	VEC2	wheels[4];
	VEC2	w[4];
	float	sn, cs;
	int		i;
	int		y;

	set_clip(buffer, 0, 0, SCREEN_W-1, SCREEN_H-1);

	clear_to_color(buffer, makecol(255, 255, 255) );	// white

	sn = sin(car->angle);
	cs = cos(car->angle);

	screen_pos.x =  car->position_wc.x * scale + SCREEN_W/2;
	screen_pos.y = -car->position_wc.y * scale + SCREEN_H/2;
	
	while(screen_pos.y < 0)
		screen_pos.y += SCREEN_H;
	while(screen_pos.y > SCREEN_H)
		screen_pos.y -= SCREEN_H;
	while(screen_pos.x < 0)
		screen_pos.x += SCREEN_W;
	while(screen_pos.x > SCREEN_W)
		screen_pos.x -= SCREEN_W;

	draw_trail( buffer, car );


	//
	// Draw car body
	//

	col = makecol(160,0,0);

	// wheels: 0=fr left, 1=fr right, 2 =rear right, 3=rear left

	corners[0].x = -car->cartype->width/2;
	corners[0].y = -car->cartype->length/2;

	corners[1].x = car->cartype->width/2;
	corners[1].y = -car->cartype->length/2;

	corners[2].x = car->cartype->width/2;
	corners[2].y = car->cartype->length/2;

	corners[3].x = -car->cartype->width/2;
	corners[3].y = car->cartype->length/2;

	for(i = 0; i <= 3; i++)
	{
		w[i].x = cs*corners[i].x - sn*corners[i].y;
		w[i].y = sn*corners[i].x + cs*corners[i].y;
		corners[i].x = w[i].x;
		corners[i].y = w[i].y;
	}

	for(i = 0; i <= 3; i++)
	{
		corners[i].x *= scale;
		corners[i].y *= scale;
		corners[i].x += screen_pos.x;
		corners[i].y += screen_pos.y;
	}

	line(buffer, corners[0].x, corners[0].y, corners[1].x, corners[1].y, col);
	line(buffer, corners[1].x, corners[1].y, corners[2].x, corners[2].y, col);
	line(buffer, corners[2].x, corners[2].y, corners[3].x, corners[3].y, col);
	line(buffer, corners[3].x, corners[3].y, corners[0].x, corners[0].y, col);

	//
	// Draw wheels
	//
	col = makecol(0,0,160);


	// wheels: 0=fr left, 1=fr right, 2 =rear right, 3=rear left

	wheels[0].x = -car->cartype->width/2;
	wheels[0].y = -car->cartype->b;

	wheels[1].x = car->cartype->width/2;
	wheels[1].y = -car->cartype->b;

	wheels[2].x = car->cartype->width/2;
	wheels[2].y = car->cartype->c;

	wheels[3].x = -car->cartype->width/2;
	wheels[3].y = car->cartype->c;


	for(i = 0; i <= 3; i++)
	{
		w[i].x = cs*wheels[i].x - sn*wheels[i].y;
		w[i].y = sn*wheels[i].x + cs*wheels[i].y;
		wheels[i].x = w[i].x;
		wheels[i].y = w[i].y;
	}

	for(i = 0; i <= 3; i++)
	{
		wheels[i].x *= scale;
		wheels[i].y *= scale;
		wheels[i].x += screen_pos.x;
		wheels[i].y += screen_pos.y;
	}

	draw_wheel( 0, buffer, car, wheels[0].x, wheels[0].y, front_slip);
	draw_wheel( 1, buffer, car, wheels[1].x, wheels[1].y, front_slip);
	draw_wheel( 2, buffer, car, wheels[2].x, wheels[2].y, rear_slip);
	draw_wheel( 3, buffer, car, wheels[3].x, wheels[3].y, rear_slip);

/*
	// "wheel spokes" to show Ackermann centre of turn
	//
	line( buffer, wheels[0].x, wheels[0].y,
		wheels[0].x -cos(car->angle+car->steerangle)*100,
		wheels[0].y -sin(car->angle+car->steerangle)*100,col);
	line( buffer, wheels[3].x, wheels[3].y,
		wheels[3].x -cos(car->angle)*100,
		wheels[3].y -sin(car->angle)*100,col);
*/

	col = makecol(0, 100,100);


	// Velocity vector dial
	//
#define VDIAL_X 550
#define VDIAL_Y	120
	circle(buffer, VDIAL_X, VDIAL_Y, 50, col);
	line(buffer, VDIAL_X, VDIAL_Y, VDIAL_X+velocity.x, VDIAL_Y-velocity.y, col);

#define VWDIAL_X 550
#define VWDIAL_Y 260
	circle(buffer, VWDIAL_X, VWDIAL_Y, 50, col);
	col = makecol(0, 0, 100);
	line(buffer, VWDIAL_X, VWDIAL_Y, VWDIAL_X+car->velocity_wc.x, VWDIAL_Y-car->velocity_wc.y, col);


#define THROTTLE_X 400
#define THROTTLE_Y 120
	col = makecol(0, 0, 0);
	line(buffer, THROTTLE_X, THROTTLE_Y, THROTTLE_X, THROTTLE_Y-100, col);
	col = makecol(100, 0,0);
	line(buffer, THROTTLE_X+1, THROTTLE_Y, THROTTLE_X+1, THROTTLE_Y-car->throttle, col);

#define BRAKE_X 440
#define BRAKE_Y 120
	col = makecol(0, 0, 0);
	line(buffer, BRAKE_X, BRAKE_Y, BRAKE_X, BRAKE_Y-100, col);
	col = makecol(0, 0,100);
	line(buffer, BRAKE_X+1, BRAKE_Y, BRAKE_X+1, BRAKE_Y-car->brake, col);

#define STEER_X 420
#define STEER_Y 160
	col = makecol(0, 0, 0);
	arc(buffer,STEER_X,STEER_Y,itofix(20),itofix(108),35, col);
	col = makecol(0, 100, 0);
	line(buffer, STEER_X,STEER_Y, STEER_X+(int)(sin(car->steerangle)*30.0), STEER_Y-(int)(cos(car->steerangle)*30.0), col);

#define SLIP_X 420
#define SLIP_Y 200
	col = makecol(0, 0, 0);
	arc(buffer,SLIP_X,SLIP_Y,itofix(20),itofix(108),35, col);
	col = makecol(0, 100, 0);
	line(buffer, SLIP_X,SLIP_Y, SLIP_X+(int)(sin(sideslip)*30.0), SLIP_Y-(int)(cos(sideslip)*30.0), col);

#define ROT_X 420
#define ROT_Y 240
	col = makecol(0, 0, 0);
	arc(buffer,ROT_X,ROT_Y,itofix(20),itofix(108),35, col);
	col = makecol(0, 100, 0);
	line(buffer, ROT_X,ROT_Y, ROT_X+(int)(sin(rot_angle)*30.0), ROT_Y-(int)(cos(rot_angle)*30.0), col);

#define AF_X 450
#define AF_Y 280
	col = makecol(0, 0, 0);
	arc(buffer,AF_X,AF_Y,itofix(20),itofix(108),35, col);
	col = makecol(0, 100, 0);
	line(buffer, AF_X,AF_Y, AF_X+(int)(sin(slipanglefront)*30.0), AF_Y-(int)(cos(slipanglefront)*30.0), col);

#define AR_X 450
#define AR_Y 320
	col = makecol(0, 0, 0);
	arc(buffer,AR_X,AR_Y,itofix(20),itofix(108),35, col);
	col = makecol(0, 100, 0);
	line(buffer, AR_X,AR_Y, AR_X+(int)(sin(slipanglerear)*30.0), AR_Y-(int)(cos(slipanglerear)*30.0), col);

	text_mode(-1);

#define TEXT_X	10
	col = makecol(100, 100, 100);
	y = 0;
	sprintf(str, "scale %f.1 pixels/m <Q,W>", scale);
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "alpha front %8.6f deg", slipanglefront *180.0/M_PI);
	textout(buffer, font, str, TEXT_X, y+=10, col);
	sprintf(str, "alpha rear  %8.6f deg", slipanglerear * 180.0/M_PI);
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "f.lat front %8.2f N", flatf.y );
	textout(buffer, font, str, TEXT_X, y+=10, col);
	sprintf(str, "f.lat rear  %8.2f N", flatr.y );
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "force.x     %8.2f N", force.x );
	textout(buffer, font, str, TEXT_X, y+=10, col);
	sprintf(str, "force.y lat %8.2f N", force.y );
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "torque      %8.2f Nm", torque );
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "ang.vel.    %8.2f rad/s", car->angularvelocity );
	textout(buffer, font, str, TEXT_X, y+=10, col);

	sprintf(str, "Esc=quit Q/W=zoom RCtrl=brake Up/Down=accelerator Space=4wheel slip" );
	textout(buffer, font, str, 0, SCREEN_H-20, col);
}


// Go into graphics mode
//
int	set_video( void )
{
	int	gfx_mode = GFX_AUTODETECT_WINDOWED;
	int	gfx_w = 640;
	int	gfx_h = 480;


	set_color_depth(8);
	if (set_gfx_mode (gfx_mode, gfx_w, gfx_h, 0, 0) != 0)
	{
		set_gfx_mode(GFX_TEXT, 0, 0, 0, 0);
		printf("Error setting graphics mode\n%s\n\n", allegro_error);
		exit (0);
	}
	return 1;
}


// take_screen_shot - Dump current screen contents to a file
//
void take_screen_shot( void )
{
	BITMAP		*buf;
	PALETTE 	pal;
	int			ok;
	FILE		*fp;
	int			counter;
	char		filename[20];
	static char	msg[40];

	buf = create_bitmap(SCREEN_W, SCREEN_H);
	get_palette( pal );

	acquire_screen();
	blit(screen, buf, 0, 0, 0,0, buf->w, buf->h);
	release_screen();

	counter = 1;

	do
	{
		sprintf(filename, "screen%02d.bmp", counter);		// screen01.bmp, screen02.bmp, etc
		fp = fopen(filename, "r");
		if( fp != NULL )
		{
			// file already exists, close it and try next number
			fclose(fp);
			counter++;
		}

	} while (fp != NULL);
	// we now have a filename that doesn't yet exist


	ok= save_bitmap( filename, buf, pal);
	destroy_bitmap( buf );
	return;
}



/*
 * End of Render module
 */

/*
 * Physics module
 */
void init_cartypes( void )
{
	CARTYPE	*cartype;

	cartype = &cartypes[0];
	cartype->b = 1.0;					// m							
	cartype->c = 1.0;					// m
	cartype->wheelbase = cartype->b + cartype->c;
	cartype->h = 1.0;					// m
	cartype->mass = 1500;				// kg			
	cartype->inertia = 1500;			// kg.m			
	cartype->width = 1.5;				// m
	cartype->length = 3.0;				// m, must be > wheelbase
	cartype->wheellength = 0.7;
	cartype->wheelwidth = 0.3;
}

void init_car( CAR *car, CARTYPE *cartype )
{
	car->cartype = cartype;
	
	car->position_wc.x = 0;
	car->position_wc.y = 0;
	car->velocity_wc.x = 0;
	car->velocity_wc.y = 0;

	car->angle = 0;
	car->angularvelocity = 0;

	car->steerangle = 0;
	car->throttle = 0;
	car->brake = 0;
}

// These constants are arbitrary values, not realistic ones.

#define	DRAG		5.0		 		/* factor for air resistance (drag) 	*/
#define	RESISTANCE	30.0			/* factor for rolling resistance */
#define CA_R		-5.20			/* cornering stiffness */
#define CA_F		-5.0			/* cornering stiffness */
#define MAX_GRIP	2.0				/* maximum (normalised) friction force, =diameter of friction circle */

void do_physics( CAR *car, float delta_t )
{
	sn = sin(car->angle);
	cs = cos(car->angle);

	if( car->steerangle != 0.0f )
	{
		int breakme = 1;
	}

	// SAE convention: x is to the front of the car, y is to the right, z is down

	//	bangz: Velocity of Car. Vlat and Vlong
	// transform velocity in world reference frame to velocity in car reference frame
	velocity.x =  cs * car->velocity_wc.y + sn * car->velocity_wc.x;
	velocity.y = -sn * car->velocity_wc.y + cs * car->velocity_wc.x;

// Lateral force on wheels
//	
	// Resulting velocity of the wheels as result of the yaw rate of the car body
	// v = yawrate * r where r is distance of wheel to CG (approx. half wheel base)
	// yawrate (ang.velocity) must be in rad/s
	//
	yawspeed = car->cartype->wheelbase * 0.5 * car->angularvelocity;	

	//bangz: velocity.x = fVLong_, velocity.y = fVLat_
	if( velocity.x == 0 )		// TODO: fix singularity
		rot_angle = 0;
	else
		rot_angle = atan2( yawspeed, velocity.x);

	// Calculate the side slip angle of the car (a.k.a. beta)
	if( velocity.x == 0 )		// TODO: fix singularity
		sideslip = 0;
	else
		sideslip = atan2( velocity.y, velocity.x);		

	// Calculate slip angles for front and rear wheels (a.k.a. alpha)
	slipanglefront = sideslip + rot_angle - car->steerangle;
	slipanglerear  = sideslip - rot_angle;

	// weight per axle = half car mass times 1G (=9.8m/s^2) 
	weight = car->cartype->mass * 9.8 * 0.5;	
	
	// lateral force on front wheels = (Ca * slip angle) capped to friction circle * load
	flatf.x = 0;
	flatf.y = CA_F * slipanglefront;
	flatf.y = MIN(MAX_GRIP, flatf.y);
	flatf.y = MAX(-MAX_GRIP, flatf.y);
	flatf.y *= weight;
	if(front_slip)
		flatf.y *= 0.5;

	// lateral force on rear wheels
	flatr.x = 0;
	flatr.y = CA_R * slipanglerear;
	flatr.y = MIN(MAX_GRIP, flatr.y);
	flatr.y = MAX(-MAX_GRIP, flatr.y);
	flatr.y *= weight;
	if(rear_slip)
		flatr.y *= 0.5;

	// longtitudinal force on rear wheels - very simple traction model
	ftraction.x = 100*(car->throttle - car->brake*SGN(velocity.x));	
	ftraction.y = 0;
	if(rear_slip)
		ftraction.x *= 0.5;

// Forces and torque on body
	
	// drag and rolling resistance
	resistance.x = -( RESISTANCE*velocity.x + DRAG*velocity.x*ABS(velocity.x) );
	resistance.y = -( RESISTANCE*velocity.y + DRAG*velocity.y*ABS(velocity.y) );

	// sum forces
	force.x = ftraction.x + sin(car->steerangle) * flatf.x + flatr.x + resistance.x;
	force.y = ftraction.y + cos(car->steerangle) * flatf.y + flatr.y + resistance.y;	

	// torque on body from lateral forces
	torque = car->cartype->b * flatf.y - car->cartype->c * flatr.y;

// Acceleration
	
	// Newton F = m.a, therefore a = F/m
	acceleration.x = force.x/car->cartype->mass;
	acceleration.y = force.y/car->cartype->mass;
	
	angular_acceleration = torque / car->cartype->inertia;

// Velocity and position
	
	// transform acceleration from car reference frame to world reference frame
	acceleration_wc.x =  cs * acceleration.y + sn * acceleration.x;
	acceleration_wc.y = -sn * acceleration.y + cs * acceleration.x;

	// velocity is integrated acceleration
	//
	car->velocity_wc.x += delta_t * acceleration_wc.x;
	car->velocity_wc.y += delta_t * acceleration_wc.y;

	// position is integrated velocity
	//
	car->position_wc.x += delta_t * car->velocity_wc.x;
	car->position_wc.y += delta_t * car->velocity_wc.y;


// Angular velocity and heading

	// integrate angular acceleration to get angular velocity
	//
	car->angularvelocity += delta_t * angular_acceleration;

	// integrate angular velocity to get angular orientation
	//
	car->angle += delta_t * car->angularvelocity ;

}
	
/*
 * End of Physics module
 */


/*
 * Input module
 */


int process_input(  CAR *car )
{
	int		keycode;
	int		quit;

	quit = 0;


	// discrete keypresses
	//
	while( keypressed() )
	{
		keycode = readkey();

		if ((keycode >> 8) == KEY_ESC )			// Esc to Quit
		{
			quit=1;
		}

		if ((keycode >> 8) == KEY_F12)			// F12 to reset
		{
			init_car( car, &cartypes[0] );
			init_trail();
		}

		if ((keycode >> 8) == KEY_F6)			// F6 for screen shot
		{
			take_screen_shot();
		}

	}

	if( key[KEY_UP] )	// throttle up
	{
		if( car->throttle < 100)
			car->throttle += 10;
	}
	if( key[KEY_DOWN] ) // throttle down
	{
		if( car->throttle >= 10)
			car->throttle -= 10;
	}

	if( key[KEY_RCONTROL] )	// brake
	{
		car->brake = 100;
		car->throttle = 0;
	}
	else
		car->brake = 0;

	// Steering 
	//
	if( key[KEY_LEFT] )
	{
		if( car->steerangle > - M_PI/4.0 )
			car->steerangle -= M_PI/32.0;
	}
	else if( key[KEY_RIGHT] )
	{
		if( car->steerangle <  M_PI/4.0 )
			car->steerangle += M_PI/32.0;
	}

	// Zoom in, zoom out
	if( key[KEY_Q] )
		scale+=1.0;
	if( key[KEY_W] )
		scale-=1.0;

	// Let front, rear or both axles slip
	rear_slip = 0;
	front_slip = 0;
	if( key[KEY_R] )
		rear_slip = 1;
	if( key[KEY_F] )
		front_slip = 1;
	if( key[KEY_SPACE] )
	{
		front_slip = 1;
		rear_slip = 1;
	}
	return quit;
}

/*
 * End of Input module
 */



int main( int argc, char *argv[] )
{
	BITMAP 		*buffer;
	int			quit;
	CAR			car;
	int			lastticks=0;
	int			lastiticks = 0;

	allegro_init ();
	install_keyboard ();
	install_timer();


	set_video();

	// tick counter - incremented every DELTA_T second
	// Used to make game speed independent of frame rate
	//
	LOCK_FUNCTION(ticks_timer);
	LOCK_VARIABLE(ticks);
	install_int( ticks_timer, DELTA_T * 1000);	// ms

	// itick counter - sample rate for keyboard input
	// 
	LOCK_FUNCTION(iticks_timer);
	LOCK_VARIABLE(iticks);
	install_int( iticks_timer, INPUT_DELTA_T * 1000);	// ms

	buffer = create_bitmap(SCREEN_W, SCREEN_H);

	// initial scale of rendering
	scale = 10;						// pixels per m
	
	init_cartypes();
	init_car( &car, &cartypes[0] );
	
	init_trail();

	quit = 0;
	while(!quit)
	{
		render(buffer, &car);

		// Copy the memory buffer to the screen
		//
		blit(buffer, screen, 0, 0, 0, 0, SCREEN_W, SCREEN_H);

		// Call input function once per itick
		if( iticks != lastiticks )
		{
			lastiticks = iticks;
			// Get keyboard input
			//
			quit = process_input(&car);
		}
		
		// Call movement functions once per tick
		if( ticks != lastticks )
		{
			lastticks = ticks;

			do_physics(&car, DELTA_T);
			add_to_trail( car.position_wc.x, car.position_wc.y, car.angle );
		}
	}


	destroy_bitmap(buffer);

	remove_timer();
	allegro_exit();
	return 0;
}
END_OF_MAIN();


