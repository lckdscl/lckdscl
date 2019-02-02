var initialSudoku =  [[0, 2, 0, 9, 0, 0, 0, 0, 0],
                      [5, 0, 9, 0, 0, 0, 1, 0, 7],
                      [0, 0, 8, 2, 0, 3, 5, 6, 9],
                      [0, 9, 0, 1, 3, 0, 0, 7, 8],
                      [0, 0, 0, 0, 0, 0, 0, 0, 0],
                      [1, 6, 0, 0, 9, 7, 0, 4, 0],
                      [2, 1, 7, 5, 0, 4, 6, 0, 0],
                      [0, 0, 6, 0, 0, 0, 4, 0, 1],
                      [9, 0, 0, 0, 0, 1, 0, 8, 0]
                     ];

initialSudoku =      [[0, 0, 0, 0, 0, 0, 0, 6, 4],
                      [0, 5, 7, 0, 2, 0, 0, 0, 0],
                      [0, 8, 0, 3, 0, 0, 0, 0, 0],
                      [1, 0, 0, 2, 4, 6, 0, 9, 0],
                      [0, 0, 3, 7, 0, 0, 0, 0, 0],
                      [0, 0, 0, 8, 0, 1, 0, 0, 0],
                      [4, 0, 0, 0, 5, 0, 0, 0, 8],
                      [0, 2, 1, 0, 0, 0, 0, 0, 0],
                      [0, 0, 0, 1, 0, 0, 0, 7, 0]
                     ];

initialSudoku =      [[0, 0, 0, 0, 4, 0, 1, 0, 5],
                      [0, 9, 0, 0, 6, 0, 0, 0, 7],
                      [0, 1, 0, 7, 0, 0, 0, 4, 0],
                      [0, 0, 0, 0, 0, 0, 9, 2, 6],
                      [0, 3, 0, 0, 0, 0, 0, 7, 0],
                      [2, 6, 9, 0, 0, 0, 0, 0, 0],
                      [0, 4, 0, 0, 0, 1, 0, 3, 0],
                      [1, 0, 0, 0, 5, 0, 0, 9, 0],
                      [6, 0, 7, 0, 2, 0, 0, 0, 0]
                     ];


function SudokuCell(possibleValues, row, column, zone, sudokuId) {
    this.possibleValues = possibleValues;
    this.row = row;
    this.column = column;
    this.zone = zone;
    this.node = document.createElement("div");
    text = document.createTextNode(this.possibleValues.join());
    this.node.appendChild(text);
    this.node.setAttribute("class", "sudoku-cell cell-"+possibleValues.length);
    var sudoku = document.getElementById(sudokuId);
    if(sudoku)
        sudoku.appendChild(this.node);
    this.checked = false;
    this.attempt = false;
    return this;
}

SudokuCell.prototype.update = function () {
    this.node.innerHTML = this.possibleValues.join();
    this.node.setAttribute("class", "sudoku-cell " + (this.attempt ? "attempt" : (this.checked ? "checked" : "cell-"+this.possibleValues.length)));
}

SudokuCell.prototype.check = function() {
    this.checked = true;
    this.update();
}

SudokuCell.prototype.copy= function(sudokuId){
    var copy = new SudokuCell(this.possibleValues, this.row, this.column, this.zone, sudokuId);
    copy.checked = this.checked;
    copy.update();
    
    return copy;
}

function Sudoku(initialSudoku, sudokuId, parent) {
    'use strict'
    this.parent = parent;
    this.id = sudokuId;
    this.node = document.createElement("div");
    this.node.className = "sudoku-container";
    this.node.id = sudokuId;
    document.getElementById("sudokus").appendChild(this.node);
    if(Array.isArray(initialSudoku.cells)){
       this.cells = initialSudoku.cells.map(function(cell) {
            return cell.copy(sudokuId);
        })
    } else {
        this.cells = initialSudoku.map(function (row, rowIndex) {
            return row.map(function (cell, cellIndex) {
                var zone = Math.floor(rowIndex/3) + Math.floor(cellIndex/3)*3;
                return new SudokuCell(cell ? [cell] : [1, 2, 3, 4, 5, 6, 7, 8, 9], rowIndex, cellIndex, zone, sudokuId);
            });
        }).flat();
    }
}

Sudoku.prototype.chooseAttempt = function() {
    var dummyCell = new SudokuCell([0,0,0,0,0,0,0,0,0],0,0,0);
    return this.cells.reduce(function(acc, curr) {
        //console.log(acc);
        return (acc.possibleValues.length > curr.possibleValues.length && curr.possibleValues.length > 1) ? curr : acc;        
    }, dummyCell)
}

Sudoku.prototype.clearAll = function (iCell) {
    //console.log(this);
    iCell.check();
    function InTheArea(cell){
        return (cell.row == iCell.row || cell.column == iCell.column || cell.zone == iCell.zone) && !(cell.row == iCell.row && cell.column == iCell.column);
    }
    this.cells.filter(InTheArea).map(function(cell) {
        cell.possibleValues = cell.possibleValues.filter(posValue => posValue != iCell.possibleValues[0]);
        cell.update();
    })
    return this;
}

Sudoku.prototype.solve = function() {
    console.log(this.id);
    var emptyCells = this.cells.filter(cell => (cell.possibleValues.length ==0)).length;
    if(emptyCells > 0) {
        
        this.node.className += " failed-attempt";
        var attemptedCell = this.cells.filter(cell => cell.attempt == true)[0];
        console.log(attemptedCell);
        var parentCell = this.parent.cells.filter(cell => (cell.row == attemptedCell.row && cell.column == attemptedCell.column))[0];
        console.log(parentCell);
        parentCell.possibleValues = parentCell.possibleValues.filter(posValue => posValue != attemptedCell.possibleValues[0]);
        
        parentCell.update();
        this.parent.node.scrollIntoView({behavior:"smooth"});
        this.parent.solve();
        return 0;
        
    }
    
    var cellsToCheck = this.cells.filter(cell => (cell.possibleValues.length == 1 && cell.checked == false)).map(function(cellToCheck, index){
        setTimeout(function(sudoku, cell) {
            sudoku.clearAll(cellToCheck);
        }, index*500, this, cellToCheck);
    }, this).length;
    if(cellsToCheck > 0){
        setTimeout(function(sudoku){
            sudoku.solve();
        }, cellsToCheck*500+50, this);
    } else {        
        var cellsLeft = this.cells.filter(cell => (cell.possibleValues.length > 1)).length;
        if(cellsLeft>0){
            var cellSuspect = this.chooseAttempt();
            console.log(cellAttempt);
            var valueAttempt = cellSuspect.possibleValues[0];
            var subSudokuId = this.id+"-"+cellSuspect.row+cellSuspect.column+valueAttempt;
            var subSudoku = new Sudoku(this, subSudokuId, this);
            var cellAttempt = subSudoku.chooseAttempt();
            cellAttempt.possibleValues = cellAttempt.possibleValues.slice(0,1);
            cellAttempt.attempt=true;
            cellAttempt.update();
            subSudoku.node.scrollIntoView({behavior:"smooth"});
            //console.log(cellAttempt.possibleValues.length);
            subSudoku.solve();
            
        } else {
            return 1;
        }
    }
}


var budoku = new Sudoku(initialSudoku, "sudokuId");
budoku.solve();




