(function(){

//************************************************************************************************************
const normalize = function(y, my, My, mY, MY) {
    return (((y - my)*MY) / (My - my)) + mY;
}

//************************************************************************************************************
const Editor = function($editor, $canvas, two) {
    let self = this;
    self.$editor = $editor;
    self.$canvas = $canvas;
    self.two = two;


    let MAX_Y = self.two.height;
    let MIN_Y = 0;

    let MAX_X = self.two.width;
    let MIN_X = 0;

    //--------------------------------------------------------------------------------------------------------
    self.draw = function(layers) {
        this.two.clear();

        let outline = this.two.makeRectangle(MIN_X + (MAX_X-MIN_X)/2, MIN_Y + (MAX_Y-MIN_Y)/2, MAX_X, MAX_Y);
        outline.stroke = "black";

        let num_layers = layers.length;
        let num_values = 0;
        let points = [MIN_X, MIN_Y];


        let min_value = layers[0][0];
        let max_value = layers[0][0];
        for(let i = 0; i < num_layers; ++i) {
            let layer = layers[i];
            for(let j = 0, l = layer.length; j < l; ++j) {
                if(layer[j] > max_value) {
                    max_value = layer[j];
                } else if(layer[j] < min_value) {
                    min_value = layer[j];
                }
                ++num_values;
            }
        }

        let xdelta = (MAX_X-MIN_X) / num_values;
        let xoffset = MIN_X;

        for(let i = 0; i < num_layers; ++i) {
            let layer = layers[i];
            for(let j = 0, l = layer.length; j < l; ++j) {
                points.push(xoffset);

                points.push(normalize(layer[j], min_value, max_value, MIN_Y, MAX_Y));

                xoffset += xdelta;
            }
        }

        points.push(points[points.length-2]]);
        points.push(MIN_Y);
        points.push(false);
        this.polygon = this.two.makePath(...points);
        this.polygon.fill = "green"

        this.two.update();
    }
}


//************************************************************************************************************
let splat = {
    editors : [],
    textarea_debug : document.getElementById("debug")
};

//************************************************************************************************************
if(splat.textarea_debug) {
    splat.logger = function(message) {
        splat.textarea_debug.value += message + "\n";
    }
} else {
    splat.logger = ()=>{}
}

//************************************************************************************************************
this.splat = splat;

//************************************************************************************************************
$(this).ready(function() {

    $(".nerve-splat-editor").each(function(){
        let $this = $(this),
            $canvas = $('<div id="canvas'+(splat.editors.length)+'"><div></div></div>');

        // Construct all of the HTML elements needed.
        $this.append($canvas);
        let mytwo = new Two({width: 500, height: 500}).appendTo($canvas.get(0));

        splat.editors.push(new Editor($this, $canvas, mytwo));
        mytwo.update();
    })
});


/*



var COLORS = ["white", "green", "blue", "orange"];

var MAX_PRIME_INDEX = PRIMES.length-1;
var MAX_PRIME = PRIMES[MAX_PRIME_INDEX];
var MID_PRIME_INDEX = Math.floor(MAX_PRIME_INDEX/2);

var DEFAULT_SIDE = 10;

function CheckPrime(num) {
  // Worst case should be 10 iterations if within the PRIMES array.
  if(num <= MAX_PRIME) {
    var min = 0;
    var max = MAX_PRIME_INDEX;
    var guess = MID_PRIME_INDEX;
    
    while(1) {
      if(num === PRIMES[min] || num === PRIMES[guess] || num === PRIMES[max]) return true;
      
      if(PRIMES[guess] < num) min = guess + 1;
      else max = guess - 1;
      guess = Math.floor((min + max) / 2);
      
      if(max < min) return false;
    };
  }
  
  // If not within the bounds of the PRIMES array then use the sqrt mathod.
  for(var i = 2, s = Math.sqrt(num); i <= s; ++i)
    if(num % i === 0) return false; 
  return num !== 1;
};

function computeColorIndex(prime_index, num) {
  var value = 2*num - PRIMES[prime_index];
  var prime = PRIMES[prime_index];
  return (num >= ((prime + 3)/2) && CheckPrime(value)) ? ((num >= prime) ? 1 : 2) : 0;
};

function Cell(prime_index, num, X, Y, TWO, SIDE, color_index) {
  this.prime = PRIMES[prime_index];
  this.value = 2*num - this.prime;
  this.prime_index = prime_index;
  this.num = num;
  this.color_index = color_index;
  this.color = COLORS[this.color_index];
  this.y_shift = prime_index * SIDE;
  this.x_shift = (num - 3) * SIDE;
  this.cell = TWO.makeRectangle(this.x_shift + X, this.y_shift + Y, SIDE, SIDE);
  this.cell.fill = this.color;
  this.cell.stroke = this.color;
};

function Graph() {
  this.TWO = new Two({width: 2000, height: 6000}).appendTo(document.getElementById("canvas"));
  this.SIDE = DEFAULT_SIDE;
  this.x_shift = 20;
  this.y_shift = 20;
  this.HEIGHT = 32;
  this.WIDTH = 71;
  this.CELLS = [];
  this.POLYGONS = [];
  this.ROTATION = 0;
  this.GROUP_X = this.x_shift;
  this.GROUP_Y = this.y_shift;
};

Graph.prototype.update = function() {
  this.CELLS = [];
  this.TWO.clear();
  this.POLYGONS = [];
  for(var i = this.HEIGHT - 1; i--;) {
    this.CELLS[i] = [];
    for(var j = this.WIDTH + 3; j-- >= 3;) {
      var color_index = computeColorIndex(i, j);
      if(color_index !== 0) {
        var cell = new Cell(i, j, this.x_shift, this.y_shift, this.TWO, this.SIDE, color_index);
        this.CELLS[i].unshift(cell);
        this.POLYGONS.push(cell.cell);
      }
    }
  }
  this.GROUP = this.TWO.makeGroup(this.POLYGONS);
  this.GROUP.rotation = this.ROTATION;
  this.GROUP.translation.set(this.GROUP_X, this.GROUP_Y);
  this.TWO.update();
};

Graph.prototype.select = function(n) {
  for(var i = this.HEIGHT-1; i--;) {
    if(n < this.CELLS[i].length) {
      this.CELLS[i][n].color_index = 3;
      this.CELLS[i][n].color = COLORS[this.CELLS[i][n].color_index];
      this.CELLS[i][n].cell.fill = this.CELLS[i][n].color;
      this.CELLS[i][n].cell.stroke = this.CELLS[i][n].color;
    }
  }
  this.TWO.update();
}




*/

})();
