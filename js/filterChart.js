function FilterChart(chartInstance, sourceInstance) {

  this.chartInstance = chartInstance;
  this.sourceInstance = sourceInstance;

  sourceInstance.addHook('afterChange', onSourceChange);

  this.fillTheFilterTable = function() {
    this.fillTheColumnChoices();
    this.fillWithData();
  };

  this.fillTheColumnChoices = function() {
    var headers = this.sourceInstance.getColHeader();
    var filterContainer = document.querySelector('#visible-columns');
    var checkboxContainer = filterContainer.querySelector('.column').cloneNode(true);
    var tempCheckboxContainer;
    var checkbox;
    var label;

    while (filterContainer.firstChild) {
      filterContainer.removeChild(filterContainer.firstChild);
    }

    for (var i = 0; i < headers.length; i++) {
      tempCheckboxContainer = checkboxContainer.cloneNode(true);
      checkbox = tempCheckboxContainer.querySelector('input');
      label = tempCheckboxContainer.querySelector('label');

      checkbox.id = 'column_' + i;
      checkbox.setAttribute('checked', true);
      label.innerText = headers[i];

      filterContainer.appendChild(tempCheckboxContainer);
    }
  };

  this.fillWithData = function() {
    var rowCount = this.sourceInstance.countRows();
    var columnCount = this.sourceInstance.countCols();
    var hotHeaders = this.sourceInstance.getColHeader();
    var hotData = this.sourceInstance.getData();
    var tableHeader = document.querySelector('#filter table thead');
    var tableBody = document.querySelector('#filter table tbody');
    var tempRow;
    var tempCell;
    var skipRow;

    tempRow = document.createElement('TR');

    for (var j = 0; j < columnCount; j++) {
      tempCell = document.createElement('TH');
      tempCell.innerHTML = hotHeaders[j];
      tempRow.appendChild(tempCell);
    }
    tableHeader.appendChild(tempRow);

    for (var i = 0; i < rowCount; i++) {
      tempRow = document.createElement('TR');

      skipRow = true;
      for (var j = 0; j < columnCount; j++) {
        tempCell = document.createElement('TD');

        if (hotData[i][j] === '' || hotData[i][j] === null) {
          continue;
        }
        skipRow = false;

        tempCell.innerHTML = hotData[i][j];
        tempRow.appendChild(tempCell);
      }

      if (!skipRow) {
        tableBody.appendChild(tempRow);
      }

      skipRow = false;
    }
  };

  function onSourceChange(changes, source) {
    var row, col, value;

    for (var i = 0; i < changes.length; i++) {
      row = changes[i][0];
      col = changes[i][1];
      value = changes[i][3];

      document.querySelector('#filter tbody tr:nth-child(' + parseInt(row + 1, 10) + ') td:nth-child(' + parseInt(col + 1, 10) + ')').innerHTML = value;
    }
  }
}