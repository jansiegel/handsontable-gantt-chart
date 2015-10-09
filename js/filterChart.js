/**
 * Creates a filtering mechanism for the Vendor, Market and Format columns.
 *
 * @param {Object} sourceInstance Handsontable instance with source data.
 * @constructor
 */
function FilterChart(sourceInstance) {

  /**
   * Handsontable instance with the Gantt Chart Plugin enabled.
   *
   * @type {Object}
   */
  this.chartInstance;
  /**
   * Handsontable instance containing the source data.
   *
   * @type {Object}
   */
  this.sourceInstance = sourceInstance;
  /**
   * Filtering list container element.
   *
   * @type {Element}
   */
  this.filterContainer = document.querySelector('#filter');
  /**
   * Filtering list table element.
   *
   * @type {Element}
   */
  this.filterTable = this.filterContainer.querySelector('table');
  /**
   * Index of the column containing the Vendor data.
   *
   * @type {Number}
   */
  this.vendorColumn;
  /**
   * Index of the column containing the Format data.
   *
   * @type {Number}
   */
  this.formatColumn;
  /**
   * Index of the column containing the Market data.
   *
   * @type {Number}
   */
  this.marketColumn;

  sourceInstance.addHook('afterChange', onSourceChange);

  /**
   * Set the chart-enabled Handsontable instance.
   *
   * @param {Object} chartInstance
   */
  this.setChartInstance = function(chartInstance) {
    this.chartInstance = chartInstance;
  };

  /**
   * Fill the filtering table with data from the source Handsontable intance.
   */
  this.fillTheFilterTable = function() {
    this.fillWithData();
  };

  /**
   * Bind the mouse events related to the filtering table.
   */
  this.bindEvents = function() {
    var _this = this;

    //display modal
    this.addEvent(document.querySelector('#filter-modal-trigger'), 'mousedown', this.toggleFilterModal);

    //appply filter changes
    this.addEvent(document.querySelector('#filter-modal .apply'), 'mousedown', function() {
      _this.applyFiltering.call(_this);
    });

    //close modal
    this.addEvent(document.querySelector('#filter-modal .cancel'), 'mousedown', this.toggleFilterModal);
    this.addEvent(document.querySelector('#filter-modal .apply'), 'mousedown', this.toggleFilterModal);
  };

  /**
   * Add a DOM event.
   *
   * @param {Element} element
   * @param {Event} event
   * @param {Function} callback
   */
  this.addEvent = function(element, event, callback) {
    element.addEventListener(event, callback);
  };

  /**
   * Clear the filtering.
   */
  this.clearFiltering = function() {
    var filterTableRows = this.filterTable.querySelectorAll('tr');
    var chartRows = this.chartInstance.countRows();
    var allRows = [];
    var i;

    for (i = 0; i < filterTableRows.length; i++) {
      filterTableRows[i].className = filterTableRows[i].className.replace(/hidden/g, '');
    }

    for (i = 0; i < chartRows; i++) {
      allRows.push(i);
    }

    this.chartInstance.getPlugin('hiddenRows').showRows(allRows);
  };

  /**
   * Apply the filtering.
   *
   * @returns {Boolean} Returns false, to prevent the default mouse event behaviour.
   */
  this.applyFiltering = function() {
    var filterModal = document.querySelector('#filter-modal');
    var vendorCheckboxes = filterModal.querySelectorAll('#vendor-filter li input[type=checkbox]');
    var formatCheckboxes = filterModal.querySelectorAll('#format-filter li input[type=checkbox]');
    var marketCheckboxes = filterModal.querySelectorAll('#market-filter li input[type=checkbox]');

    var uncheckedVendors = [];
    var uncheckedFormats = [];
    var uncheckedMarkets = [];
    var i;

    function fillUncheckedList(checkboxes, results) {
      for (i = 0; i < checkboxes.length; i++) {
        if (!checkboxes[i].checked) {
          results.push(checkboxes[i].parentNode.textContent);
        }
      }
    }

    this.clearFiltering();

    fillUncheckedList(vendorCheckboxes, uncheckedVendors);
    fillUncheckedList(formatCheckboxes, uncheckedFormats);
    fillUncheckedList(marketCheckboxes, uncheckedMarkets);

    this.filterRows(uncheckedVendors, uncheckedFormats, uncheckedMarkets);

    return false;
  };

  /**
   * Filter the filtering table and chart-enabled Handsontable instance.
   *
   * @param {Array} vendors Array of unwanted vendors.
   * @param {Array} formats Array of unwanted formats.
   * @param {Array} markets Array of unwanted markets.
   */
  this.filterRows = function(vendors, formats, markets) {
    var vendorHiddenRows = vendors.length ? this.findRowIndexes(this.vendorColumn, vendors) : null;
    var formatHiddenRows = formats.length ? this.findRowIndexes(this.formatColumn, formats) : null;
    var marketHiddenRows = markets.length ? this.findRowIndexes(this.marketColumn, markets) : null;
    var hiddenRowsPlugin = this.chartInstance.getPlugin('hiddenRows');
    var hiddenFilterTableRows = [];

    function hideChartRows(rows) {
      if (rows && rows.length > 0) {
        hiddenRowsPlugin.hideRows(rows);
      }
    }

    function addHiddenFilterTableRow(rows) {
      if (rows && rows.length > 0) {
        for (var i = 0; i < rows.length; i++) {
          if (hiddenFilterTableRows.indexOf(rows[i]) === -1) {
            hiddenFilterTableRows.push(rows[i]);
          }
        }
      }
    }

    hideChartRows(vendorHiddenRows);
    hideChartRows(formatHiddenRows);
    hideChartRows(marketHiddenRows);

    addHiddenFilterTableRow(vendorHiddenRows);
    addHiddenFilterTableRow(formatHiddenRows);
    addHiddenFilterTableRow(marketHiddenRows);

    for (var i = 0; i < hiddenFilterTableRows.length; i++) {
      this.filterTable.querySelector('tbody tr:nth-child(' + parseInt(hiddenFilterTableRows[i] + 1, 10) + ')').className += 'hidden';
    }

    //_this.filterTable.querySelector('tbody tr:nth-child(' + parseInt(rows[i] + 1, 10) + ')').className += 'hidden';

    this.chartInstance.render();
  };

  /**
   * Return indexes of rows containing the provided value.
   *
   * @param {Number} col Column index.
   * @param {Array} values Array of values.
   * @returns {Array} Array of rows.
   */
  this.findRowIndexes = function(col, values) {
    var colValues = this.sourceInstance.getDataAtCol(col);
    var result = [];

    for (var i = 0; i < colValues.length; i++) {
      for (var j = 0; j < values.length; j++) {
        if (colValues[i] === values[j] && result.indexOf(i) === -1) {
          result.push(i);
        }
      }
    }

    return result;
  };

  /**
   * Toggle (show/hide) the filtering modal.
   *
   * @returns {Boolean}
   */
  this.toggleFilterModal = function() {
    var filterModal = document.querySelector('#filter-modal');

    if (filterModal.style.display === 'none' || filterModal.style.display === '') {
      filterModal.style.top = window.scrollY + parseInt(window.innerHeight / 2, 10) + 'px';
      filterModal.style.display = 'block';
    } else {
      filterModal.style.display = 'none';
    }

    return false;
  };

  /**
   * Fill the filtering modal with data.
   *
   * @param {Number} vendorColumn Index of the column containing Vendor information.
   * @param {Number} formatColumn Index of the column containing Format information.
   * @param {Number} marketColumn Index of the column containing Market information.
   */
  this.fillTheFilterModal = function(vendorColumn, formatColumn, marketColumn) {
    this.vendorColumn = vendorColumn;
    this.formatColumn = formatColumn;
    this.marketColumn = marketColumn;

    var columnData = this.sourceInstance.getSettings().columns;
    var vendorList = columnData[vendorColumn].source;
    var formatList = columnData[formatColumn].source;
    var marketList = columnData[marketColumn].source;

    var vendorFilter = document.querySelector('#vendor-filter');
    var formatFilter = document.querySelector('#format-filter');
    var marketFilter = document.querySelector('#market-filter');

    var tempLI, tempCheckbox, tempLabel, tempTextNode, i;

    function fillList(list, filter) {
      for (i = 0; i < list.length; i++) {
        tempLI = document.createElement('LI');
        tempCheckbox = document.createElement('input');
        tempCheckbox.setAttribute('type', 'checkbox');
        tempCheckbox.setAttribute('checked', true);
        tempLabel = document.createElement('label');
        tempTextNode = document.createTextNode(list[i]);

        tempLabel.appendChild(tempCheckbox);
        tempLabel.appendChild(tempTextNode);
        tempLI.appendChild(tempLabel);

        filter.appendChild(tempLI);
      }
    }

    fillList(vendorList, vendorFilter);
    fillList(formatList, formatFilter);
    fillList(marketList, marketFilter);
  };

  /**
   * Position the filtering table to align with the chart-enabled Handsontable instance's rows.
   */
  this.positionTableWithChart = function() {
    var chartTBODYoffset = Handsontable.Dom.offset(this.chartInstance.view.wt.wtTable.TBODY);
    var filterTBODYoffset = Handsontable.Dom.offset(this.filterTable.querySelector('tbody'));

    this.filterTable.style.marginTop = chartTBODYoffset.top - filterTBODYoffset.top - 1 + 'px';
  };

  //this.fillTheColumnChoices = function() {
  //  var headers = this.sourceInstance.getColHeader();
  //  var filterContainer = document.querySelector('#visible-columns');
  //  var checkboxContainer = filterContainer.querySelector('.column').cloneNode(true);
  //  var tempCheckboxContainer;
  //  var checkbox;
  //  var label;
  //
  //  while (filterContainer.firstChild) {
  //    filterContainer.removeChild(filterContainer.firstChild);
  //  }
  //
  //  for (var i = 0; i < headers.length; i++) {
  //    tempCheckboxContainer = checkboxContainer.cloneNode(true);
  //    checkbox = tempCheckboxContainer.querySelector('input');
  //    label = tempCheckboxContainer.querySelector('label');
  //
  //    checkbox.id = 'column_' + i;
  //    checkbox.setAttribute('checked', true);
  //    label.innerText = headers[i];
  //
  //    filterContainer.appendChild(tempCheckboxContainer);
  //  }
  //};

  /**
   * Fill the filtering table with data.
   */
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

  /**
   * Source Handsontable instance's afterChange hook callback.
   *
   * @param {Array} changes List of changes.
   * @param {String} source Change source.
   */
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