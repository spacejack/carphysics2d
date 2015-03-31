#Simple 2D Car Physics Sim

Demo: http://www.spacejack.ca/projects/carphysics2d/

This is a Javascript adaptation of the ideas found in Marco Monster's often-referenced car physics paper and demo. His original paper has been [archived here](http://www.asawicki.info/Mirror/Car%20Physics%20for%20Games/Car%20Physics%20for%20Games.html). His demo code, written in C, was archived by a user on gamedev.net [here](http://freespace.virgin.net/jackie.bangs/cardemo.zip) (from [this thread](http://www.gamedev.net/topic/394292-demosource-of-marco-monsters-car-physics-tutorial/).) A Java version was [archived here](http://web.archive.org/web/20031206155251/http://www.cs.uni-magdeburg.de/~sodeike/java/CarPhysics/CarPhysics.html).

This Javascript implementation additionally borrows some ideas from [Siorki](https://github.com/Siorki)'s [js13k 2013 entry](https://github.com/Siorki/js13kgames/tree/master/2013%20-%20staccato) which also credits Marco's original paper. Siorki added some nice extras like variable front/rear size and axle distance to centre of gravity, as well as adding the vehicle's angular velocity to wheel velocity.

I've attempted to write this demo so that the details of the sim are clear and easily hackable. You can run it with or without a web server by loading index.html in your browser.

See the Car.js source for the physics implementation, in particular the doPhysics method.

####Additional Reference

[Brian Beckman's The Physics of Racing](http://phors.locost7.info/contents.htm)

####License

[MIT](http://opensource.org/licenses/MIT)
