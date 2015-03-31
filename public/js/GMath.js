"use strict";

/**  Useful Game Math stuff */
var GMath =
{
	sign: function(n)
	{
		//  Allegedly fastest if we check for number type
		return typeof n === 'number' ? n ? n < 0 ? -1 : 1 : n === n ? 0 : NaN : NaN;
	},

	clamp: function(n, min, max)
	{
		return Math.min(Math.max(n, min), max);
	},

	/**  Always positive modulus */
	pmod: function(n, m)
	{
		return (n % m + m) % m;
	}
};
