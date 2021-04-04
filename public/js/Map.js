/* 
 * The MIT License
 *
 * Copyright 2021 Paul.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var Map = function( parentElementName, pos)
{
  var parentDiv = document.getElementById(parentElementName);
  
  var zoom = 19;
        
  this.map = new L.Map(parentDiv,{
    bounceAtZoomLimits: false,
    boxZoom: false,
    closePopupOnClick: false,
    doubleClickZoom: false,
    dragging: false,
    easeLinearity: 0,
    fadeAnimation: false,
    inertia: false,
    keyboard: false,
    markerZoomAnimation: false,
    scrollWheelZoom: false,
    tap: false,
    trackResize: true,
    zoomControl: false,
    zoomAnimation: false,
    zoomSnap: 0
  });
    
  this.map.setView(pos, zoom, false);

  new L.TileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: zoom, maxNativeZoom: zoom
  }).addTo(this.map);  
};

Map.prototype.moveTo = function(position)
{
	this.map.setView(position, this.zoom);
};
