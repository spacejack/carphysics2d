/*global $e */

"use strict";

/**
 *  UI for user config car panel
 */
var ConfigPanel = function( car )
{
	this.car = car;
	this.visible = false; // starts off hidden
	this.render();
	var that = this;
	$e('config_tab').onclick = function() {that.toggle();};
	$e('btn_config_update').onclick = function() {that.updateCarConfig();};
};

ConfigPanel.prototype.toggle = function()
{
	if( this.visible )
		this.hide();
	else
		this.show();
};

ConfigPanel.prototype.show = function()
{
	if( !this.visible )
	{
		$e('config_container').style.display = 'block';
		this.visible = true;
	}
};

ConfigPanel.prototype.hide = function()
{
	if( this.visible )
	{
		$e('config_container').style.display = 'none';
		this.visible = false;
	}
};

/**  Get values from text inputs and apply to car config */
ConfigPanel.prototype.updateCarConfig = function()
{
	var cfg = this.car.config,
		newCfg = {},
		name, value;

	for( name in cfg ) if( cfg.hasOwnProperty(name) )
	{
		value = +$e('cfg_'+name).value;
		newCfg[name] = value;
	}
	this.car.setConfig(newCfg);
	this.car.smoothSteer = !!$e('chk_smoothsteer').checked;
	this.car.safeSteer = !!$e('chk_safesteer').checked;
};

//  Render data in a table element
ConfigPanel.prototype.render = function()
{
	// Build rows html of name/value pairs
	var cfg = this.car.config,
		str = '',
		name, value;

	for( name in cfg ) if( cfg.hasOwnProperty(name) )
	{
		value = this.car.config[name];
		str += '<tr><td class="property">' + name + '</td><td class="value">';
		str += '<input id="cfg_'+name+'" type="text" value="'+value+'" size="6" />';
		str += '</td></tr>';
	}
	$e('config_table').innerHTML = str;
};
