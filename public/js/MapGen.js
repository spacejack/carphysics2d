function createArray(num, dimensionx, dimensiony) {    
    var array = [];        
    for (var i = 0; i < dimensionx; i++) {       
        array.push([]);            
        for (var j = 0; j < dimensiony; j++) {           
            array[i].push(num);            
        }        
    }        return array;  
}


  //lets create a randomly generated map for our dungeon crawler
  function createMap(dimensionx, dimensiony, maxroads) {
      let maxLength = Math.max(dimensionx,dimensiony), // max length each road can have
      map = createArray(0, dimensionx, dimensiony), // create a 2d array full of 1's
      currentRow = Math.floor(dimensionx/2), // our current row - start at a random spot
      currentColumn = Math.floor(dimensiony/2), // our current column - start at a random spot
      directions = [[-1, 0], [1, 0], [0, -1], [0, 1]], // array to get a random direction from (left,right,up,down)
      lastDirection = [], // save the last direction we went
      randomDirection; // next turn/direction - holds a value from directions

    // lets create some roads - while maxroads, dimensions, and maxLength is greater than 0.
    while (maxroads && dimensionx && dimensiony && maxLength) {

      // lets get a random direction - until it is a perpendicular to our lastDirection
      // if the last direction = left or right,
      // then our new direction has to be up or down,
      // and vice versa
      do {
         randomDirection = directions[Math.floor(Math.random() * directions.length)];
      } while ((randomDirection[0] === -lastDirection[0] && randomDirection[1] === -lastDirection[1]) || (randomDirection[0] === lastDirection[0] && randomDirection[1] === lastDirection[1]));

      var randomLength = Math.ceil(Math.random() * maxLength), //length the next road will be (max of maxLength)
        roadLength = 0; //current length of road being created

		// lets loop until our road is long enough or until we hit an edge
      while (roadLength < randomLength) {

        //break the loop if it is going out of the map
        if (((currentRow === 0) && (randomDirection[0] === -1)) ||
            ((currentColumn === 0) && (randomDirection[1] === -1)) ||
            ((currentRow === dimensionx - 1) && (randomDirection[0] === 1)) ||
            ((currentColumn === dimensiony - 1) && (randomDirection[1] === 1))) {
          break;
        } else {
          map[currentRow][currentColumn] = 1; //set the value of the index in map to 1 (a road, making it one longer)
          currentRow += randomDirection[0]; //add the value from randomDirection to row and col (-1, 0, or 1) to update our location
          currentColumn += randomDirection[1];
          roadLength++; //the road is now one longer, so lets increment that variable
        }
      }

      if (roadLength) { // update our variables unless our last loop broke before we made any part of a road
        lastDirection = randomDirection; //set lastDirection, so we can remember what way we went
        maxroads--; // we created a whole road so lets decrement how many we have left to create
      }
    }
    // wrap our map in newMap with dimensions increased by 2 
    let newMap = createArray(0,dimensionx+2, dimensiony+2)
    for (var i = 0; i < dimensionx; i++) {                  
        for (var j = 0; j < dimensiony; j++) {           
            newMap[i+1][j+1]=map[i][j]; 
        }           
    }  
    return newMap; // all our roads have been created and our map is complete, so lets return it to our render()
  };