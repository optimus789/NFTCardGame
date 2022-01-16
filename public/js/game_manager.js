function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size = size; // Size of the grid
  this.inputManager = new InputManager();
  this.storageManager = new StorageManager();
  this.actuator = new Actuator();

  this.startTiles = 2;

  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));

  this.setup();
}

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.setup();
};

// Keep playing after winning (allows going over 2048)
GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  if (this.over && this.count === 1) {
    let user = Moralis.User.current();
    if (user) {
      const currentScore = this.score;
      console.log("this ran");
      let node = document.getElementById("game-container-id");
      this.count = 2;
      domtoimage.toBlob(node).then(function (blob) {
        var file = new File([blob], "name1.png", {
          type: "image/png",
          lastModified: new Date(),
          size: 2,
        });
        // theCanvas = canvas;
        // document.body.appendChild(canvas);

        // Convert and download as image
        // Canvas2Image.saveAsPNG(canvas);
        // const imageData = new Buffer(canvas, "binary").toString("base64");
        const form = new FormData();
        form.append("file", file);
        const options = {
          method: "POST",
          body: form,
          headers: {
            Authorization: "663481f7-d211-4d3d-9c88-94abc311e59f",
          },
        };
        fetch("https://api.nftport.xyz/v0/files", options)
          .then((response) => {
            console.log(response);
            return response.json();
          })
          .then((responseJson) => {
            if (responseJson.ipfs_url) {
              const metadata = {
                name: "Game Card",
                description: "A game of 2048",
                image: responseJson.ipfs_url,
                attributes: [
                  {
                    display_type: "date",
                    trait_type: "created",
                    value: new Date().getTime(),
                  },
                  {
                    display_typ: "number",
                    trait_type: "Score",
                    value: currentScore,
                  },
                ],
              };
              // NFTStorage = (await import("")).default
              const str = JSON.stringify(metadata);
              const bytes = new TextEncoder().encode(str);
              const blob = new Blob([bytes], {
                type: "application/json;charset=utf-8",
              });
              var metadataFile = new File([blob], "metadata.json", {
                type: "application/json",
                size: 2,
              });
              console.log(metadataFile);
              const form = new FormData();
              form.append("file", metadataFile);
              const apiKey =
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDJmODkxMmM5NmEwNzRDZkE5OTFDMmVBREQ4Q0VkOTk2RTdDMDdjYjIiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY0MjI4MzA5MDA3NCwibmFtZSI6Ik5GVCBHYW1lIENhcmQifQ.YJiXkpS--mDOZfJg9MjmBD-n5ZnwwSD6ifY8M6L97Js";
              const options = {
                method: "POST",
                body: form,
                headers: {
                  Authorization: apiKey,
                },
              };
              fetch("https://api.nft.storage/upload", options)
                .then((response) => {
                  console.log(response);
                  return response.json();
                })
                .then((responseJson) => {
                  if (responseJson.ok) {
                    let mintToAddress = user.get("ethAddress");
                    const metadataUri = `https://ipfs.io/ipfs/${responseJson.value.cid}/metadata.json`;
                    const settings = {
                      async: false,
                      crossDomain: true,
                      url: "https://api.nftport.xyz/v0/mints/customizable",
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: "663481f7-d211-4d3d-9c88-94abc311e59f",
                      },
                      processData: false,
                      data:
                        '{\n  "chain": "polygon",\n  "contract_address": "0xDf7661ba0EbE19Bc58a74357456f0724aA97eD8e",\n  "metadata_uri": "' +
                        metadataUri +
                        '",\n  "mint_to_address": "' +
                        mintToAddress +
                        '"\n}',
                    };

                    $.ajax(settings).done(function (response) {
                      console.log(response);
                    });
                  }
                  console.log(responseJson);
                });
            }
            // Handle the response
            console.log(responseJson);
          });
        // const settings = {
        //   async: false,
        //   crossDomain: true,
        //   url: "https://api.nftport.xyz/v0/files",
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "multipart/form-data",
        //     Authorization: "663481f7-d211-4d3d-9c88-94abc311e59f",
        //   },
        //   processData: false,
        //   contentType: false,
        //   mimeType: "multipart/form-data",
        //   data: form,
        // };

        // $.ajax(settings).done(function (response) {
        //   console.log(response);
        // });
        // $("#img-out").append(canvas);
        // Clean up
        //document.body.removeChild(canvas);
      });
    }
  }
  console.log("Game over", this.over, this.count);
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  var previousState = this.storageManager.getGameState();

  // Reload the game from a previous game if present
  if (previousState) {
    this.grid = new Grid(previousState.grid.size, previousState.grid.cells); // Reload grid
    this.score = previousState.score;
    this.over = previousState.over;
    this.won = previousState.won;
    this.keepPlaying = previousState.keepPlaying;
    this.count = 1;
  } else {
    this.grid = new Grid(this.size);
    this.score = 0;
    this.over = false;
    this.won = false;
    this.keepPlaying = false;
    this.count = 1;

    // Add the initial tiles
    this.addStartTiles();
  }

  // Update the actuator
  this.actuate();
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  if (this.storageManager.getBestScore() < this.score) {
    this.storageManager.setBestScore(this.score);
  }

  // Clear the state when the game is over (game over only, not win)
  if (this.over) {
    this.count = 1;
    this.storageManager.clearGameState();
  } else {
    this.storageManager.setGameState(this.serialize());
  }

  this.actuator.actuate(this.grid, {
    score: this.score,
    over: this.over,
    won: this.won,
    bestScore: this.storageManager.getBestScore(),
    terminated: this.isGameTerminated(),
  });
};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid: this.grid.serialize(),
    score: this.score,
    over: this.over,
    won: this.won,
    keepPlaying: this.keepPlaying,
  };
};

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2: down, 3: left
  var self = this;

  if (this.isGameTerminated()) return; // Don't do anything if the game's over

  var cell, tile;

  var vector = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    this.actuate();
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0, y: -1 }, // Up
    1: { x: 1, y: 0 }, // Right
    2: { x: 0, y: 1 }, // Down
    3: { x: -1, y: 0 }, // Left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) && this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell, // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell = { x: x + vector.x, y: y + vector.y };

          var other = self.grid.cellContent(cell);

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};
