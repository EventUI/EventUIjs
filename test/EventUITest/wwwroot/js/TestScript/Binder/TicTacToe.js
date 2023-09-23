$evui.init(async function ()
{
    /**Example class for a tic-tac-toe game.
    @class*/
    var TicTacToeController = class
    {
        constructor()
        {
            var _self = this; //self reference for closures
            var _won = false; //flag to stop input if someone has won the game
            var _squareID = 0; //counter for square ID's (for debug purposes)
            var _initialized = false; //whether or not the class has already been initialized
            var _binding = null; //the binding that is managing the game

            /**Array. The array of objects that will be bound to the DOM to make up the clickable squares in the game.*/
            this.squares = [];

            /**String. The marker for whose turn it is (either X or O)*/
            this.turn = "X";

            /**Data bound command to reset the game when the "Reset" button is clicked.
            @param event The browser's event arguments.
            @param binding The Binding that is raising the event.*/
            this.reset = async function (event, binding)
            {
                this.squares = buildSquares(); //make a new set of squares to reset the game board
                this.turn = "X";
                _won = false;

                //bind the new squares and throw away the old ones
                await binding.updateAsync();
            };

            /**Initializes the class and builds the game board under the target Element.
            @param targetElement The element to append the game board under.*/
            this.initialize = async function (targetElement)
            {
                if ($evui.isElement(targetElement) === false) throw Error("Element expected.");

                if (_initialized === true) return;
                _initialized = true;

                //add the required HTML content if it hasn't been added by another instance of this class before
                if ($evui.binder.getHtmlContent("board") == null)
                {
                    var boardContent =
                        `<div style="width: 175px;">
                            <span>Current Player Turn: {{turn}}</span>
                            <button onclick='{{reset}}'>Reset</button>
                            <div evui-binder-source="squares" evui-binder-html-key="square" evui-binder-mode="append" class="gameGrid">
                            </div>
                        </div>`

                    $evui.addBindingHtmlContent("board", boardContent);

                    //check and see if the CSS for the game board has already been added. If not, go add it.
                    var existingCSS = $evui.css({ rules: [".gameGrid"] });
                    if (existingCSS == null || existingCSS.length === 0) $evui.css(`.gameGrid {display: grid; grid-gap: 1px; grid-template-columns: repeat(3, 1fr);}`);
                }

                if ($evui.binder.getHtmlContent("square") == null)
                {
                    var squareContent = `<button class='gameSquare' squareID="{{id}}" onclick="{{onClick}}">{{value}}</span>`;
                    $evui.addBindingHtmlContent("square", squareContent);

                    var existingCSS = $evui.css({ rules: [".gameSquare"] });
                    if (existingCSS == null || existingCSS.length === 0) $evui.css(`.gameSquare {min-height: 50px; max-width: 50px;}`);
                }

                this.squares = buildSquares();

                //bind the HTML and data to the DOM
                _binding = $evui.bindAsync({
                    htmlContent: "board",
                    source: this,
                    element: targetElement,
                    options:
                    {
                        eventContextMode: "parent"
                    }
                });
            };

            /**Returns the Binding object that bound the model to the DOM.*/
            this.getBinding = function ()
            {
                return _binding;
            };

            /**Data bound command that marks a square as taken by the current payer.
            @param event The browser's event arguments.
            @param binding The Binding that is raising the event.*/
            var onSquareClick = async function (event, binding)
            {
                if (_won === true || binding.source.value != null) return;

                //set the current child binding's value to the current player's mark
                binding.source.value = _self.turn;

                //update the DOM that is bound to the square that was clicked on to reflect the change
                await binding.updateAsync();

                if (checkForWinner() === true)
                {
                    _won = true;

                    //a little hack to make sure the DOM repaints before the alert is shown, otherwise the bound content change won't show up until the alert is dismissed.
                    setTimeout(function ()
                    {
                        alert(_self.turn + " wins!");
                    });
                }
                else
                {
                    changeTurns();

                    //update the root binding so that the {{turn}} data-bound value gets changed to the current player's turn
                    await binding.getRootBinding().updateAsync();
                }
            };

            /**Builds the squares for the game board.*/
            var buildSquares = function ()
            {
                var squares = [];
                for (var x = 0; x < 9; x++)
                {
                    var square = {
                        id: _squareID++,
                        index: x,
                        value: null,
                        onClick: onSquareClick
                    };

                    squares.push(square);
                }

                return squares;
            };

            /**Changes the player whose turn it is.*/
            var changeTurns = function ()
            {
                if (_self.turn === "X")
                {
                    _self.turn = "O";
                }
                else
                {
                    _self.turn = "X";
                }
            };

            /**Does the logic to see if there are 3 of the same player's marks in a row on any column or diagonal. */
            var checkForWinner = function ()
            {
                for (var x = 0; x < 3; x++)
                {
                    if (checkRowOrColumn(x, "row") === true) return true;
                }

                for (var x = 0; x < 3; x++)
                {
                    if (checkRowOrColumn(x, "column") === true) return true;
                }

                if (checkRowOrColumn(0, "leftToRight") === true) return true;
                if (checkRowOrColumn(0, "rightToLeft") === true) return true;

                return false;
            };

            /** Checks a row, column, or diagonal to see if there are 3 of the same player's mark in a row.
            @param rowOrColIndex The index of the row or column.
            @param type The "type" of sequence being checked. Either "row", "column", "leftToRight" or "rightToLeft".*/
            var checkRowOrColumn = function (rowOrColIndex, type)
            {
                var curValue = null;

                for (var x = 0; x < 3; x++)
                {
                    var index = getIndex(x, rowOrColIndex, type);
                    var curSquare = _self.squares[index];
                    if (curSquare.value == null) break;

                    if (curValue == null)
                    {
                        curValue = curSquare.value;
                    }
                    else
                    {
                        if (curValue !== curSquare.value)
                        {
                            break;
                        }
                        else
                        {
                            if (x === 2) return true;
                        }
                    }
                }

                return false;
            };

            /** Gets the index of the square to check.
            @param x The index in the row, column, or diagonal to check.
            @param index The index of the row or column to check.
            @param The "type" of sequence being checked. Either "row", "column", "leftToRight" or "rightToLeft".*/
            var getIndex = function (x, index, type)
            {
                if (type === "row")
                {
                    return x + (index * 3);
                }
                else if (type === "column")
                {
                    return (x * 3) + index;
                }
                else if (type === "rightToLeft")
                {
                    return 2 + (x * 2); //2, 4, 6
                }
                else if (type === "leftToRight") //0, 4, 8
                {
                    return (x * 4)
                }
            };
        }
    };

    var game = new TicTacToeController();
    game.initialize(document.getElementById("game"));

    var game2 = new TicTacToeController();
    game2.initialize(document.getElementById("game2"));
});