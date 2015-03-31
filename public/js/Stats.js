/*global $e */

"use strict";

/**
 *  Widget to display car state data (name value pairs)
 */
var Stats = function()
{
	this.visible = false;  // starts off hidden
	this.pairs = [];  // name/value pairs to display
	var that = this;  // attach show/hide click handler
	$e('stats_tab').onclick = function() {that.toggle();};
};

Stats.prototype.toggle = function()
{
	if( this.visible )
		this.hide();
	else
		this.show();
};

Stats.prototype.show = function()
{
	if( !this.visible )
	{
		$e('stats_table').style.display = 'table';
		this.visible = true;
	}
};

Stats.prototype.hide = function()
{
	if( this.visible )
	{
		$e('stats_table').style.display = 'none';
		this.visible = false;
	}
};

//  Add a name/value pair.
//  Be sure to clear every frame otherwise this list will grow fast!
Stats.prototype.add = function( name, value )
{
	this.pairs.push({name:name, value:value});
};

//  Should be cleared every frame
Stats.prototype.clear = function()
{
	this.pairs = [];
};

//  Render stats in a table element
Stats.prototype.render = function()
{
	if( !this.visible )
		return;

	// Build rows html of name/value pairs
	var str = '';
	for( var i = 0, l = this.pairs.length; i < l; ++i )
	{
		var nv = this.pairs[i];
		str += '<tr><td class="property">' + nv.name + '</td><td class="value">';
		if( typeof nv.value === 'number' )
			str += nv.value.toFixed(4);  // 4 decimal places to keep things tidy
		else
			str += nv.value;
		str += '</td></tr>';
	}

	$e('stats_table').innerHTML = str;
};
