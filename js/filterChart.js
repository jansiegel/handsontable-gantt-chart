/**
 * Creates a filtering mechanism for the Vendor, Market and Format columns.
 *
 * @param {Object} sourceInstance Handsontable instance with source data.
 * @constructor
 */
function FilterChart(sourceInstance) {

  var _this = this;

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

  sourceInstance.addHook('afterChange', function() {
    return onSourceChange.apply(_this, arguments);
  });
  sourceInstance.addHook('afterColumnSort', onSourceSort);

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
    var filterModalEl = document.querySelector('#filter-modal');

    //display modal
    this.addEvent(document.querySelectorAll('#filter-modal-trigger'), 'mousedown', this.toggleFilterModal);

    //appply filter changes
    this.addEvent(filterModalEl.querySelectorAll('.apply'), 'mousedown', function() {
      _this.applyFiltering.call(_this);
    });

    //close modal
    this.addEvent(filterModalEl.querySelectorAll('.cancel'), 'mousedown', this.toggleFilterModal);
    this.addEvent(filterModalEl.querySelectorAll('.apply'), 'mousedown', this.toggleFilterModal);

    //select all in modal
    this.addEvent(filterModalEl.querySelectorAll('a.all-button'), 'mousedown', function(event) {
      return _this.modalSelectEntireColumn.apply(_this, arguments);
    });

    //select none in modal
    this.addEvent(filterModalEl.querySelectorAll('a.none-button'), 'mousedown', function(event) {
      return _this.modalDeselectEntireColumn.apply(_this, arguments);
    });

    // select the year to display in the chart
    this.addEvent(document.querySelectorAll('#hot-year'), 'change', function(event) {
      return _this.onYearSelectChange.apply(_this, arguments);
    });

    // collapse all sections in the chart
    this.addEvent(document.querySelectorAll('#collapse-all'), 'mousedown', function(event) {
      return _this.collapseTheChart();
    });

    // expand all sections in the chart
    this.addEvent(document.querySelectorAll('#expand-all'), 'mousedown', function(event) {
      return _this.expandTheChart();
    });
  };

  /**
   * Add a DOM event.
   *
   * @param {NodeList} element
   * @param {Event} event
   * @param {Function} callback
   */
  this.addEvent = function(element, event, callback) {
    for(var i = 0; i < element.length; i++) {
      element[i].addEventListener(event, callback);
    }
  };

  /**
   * Sets all the checkboxes in the modal to the provided value.
   *
   * @param {HTMLElement} target Event target.
   * @param {Boolean} value Value to set the checkboxes to.
   */
  this.setAllModalCheckboxes = function(target, value) {
    var target = target;
    var parent = target;
    var checkboxes;

    while (parent.className.indexOf('section') === -1) {
      parent = parent.parentNode;
    }

    checkboxes = parent.querySelectorAll('ol li input[type=checkbox]');

    for(var i = 0; i < checkboxes.length; i++) {
      checkboxes[i].checked = value;
    }
  };

  /**
   * Select the entire checkbox column in the modal.
   *
   * @param {MouseEvent} event Mousedown event object.
   * @returns {Boolean}
   */
  this.modalSelectEntireColumn = function(event) {
    this.setAllModalCheckboxes(event.target, true);

    return false;
  };

  /**
   * Deselect the entire checkbox column in the modal.
   *
   * @param {MouseEvent} event Mousedown event object.
   * @returns {Boolean}
   */
  this.modalDeselectEntireColumn = function(event) {
    this.setAllModalCheckboxes(event.target, false);

    return false;
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
   * Get unique values from the provided column.
   *
   * @param {Number} column
   * @returns {Array}
   */
  this.getUniqueColumnValues = function(column) {
    var colValues = this.sourceInstance.getDataAtCol(column);
    var uniqueValues = [];

    for (var i = 0, colValsCount = colValues.length; i < colValsCount; i++) {
      if (colValues[i] && uniqueValues.indexOf(colValues[i]) === -1) {
        uniqueValues.push(colValues[i]);
      }
    }

    return uniqueValues;
  };

  /**
   * Clear the filter modal.
   */
  this.clearTheFilterModal = function() {
    var vendorFilter = document.querySelector('#vendor-filter');
    var formatFilter = document.querySelector('#format-filter');
    var marketFilter = document.querySelector('#market-filter');

    function removeChildren(parent) {
      while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
      }
    }

    removeChildren(vendorFilter);
    removeChildren(formatFilter);
    removeChildren(marketFilter);
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

    var vendorList = this.getUniqueColumnValues(vendorColumn);
    var formatList = this.getUniqueColumnValues(formatColumn);
    var marketList = this.getUniqueColumnValues(marketColumn);

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

  /**
   * Fill the filtering table with data.
   */
  this.fillWithData = function() {
    var rowCount = this.sourceInstance.countRows();
    var columnCount = this.sourceInstance.countCols();
    var hotHeaders = this.sourceInstance.getColHeader();
    var hotData = this.sourceInstance.getData(0, 0, this.sourceInstance.countRows() - 1, this.sourceInstance.countCols() - 1);
    var tableHeader = document.querySelector('#filter table thead');
    var tableBody = document.querySelector('#filter table tbody');
    var tempRow;
    var tempCell;
    var skipRow;

    while (tableHeader.firstChild) {
      tableHeader.removeChild(tableHeader.firstChild);
    }

    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }

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
   * Fill the options for the year selector.
   *
   * @param {Number} yearOffset Number of years to display before and after the current year.
   */
  this.fillYearSelect = function(yearOffset) {
    var selectEl = document.querySelector('#hot-year');
    var currentYear = this.chartInstance.getPlugin('ganttChart').currentYear;
    var baseYear = parseInt(currentYear - (yearOffset || 2), 10);
    var tempOptionEl;

    for (var i = baseYear; i < baseYear + 1 + (2 * yearOffset || 2); i++) {
      tempOptionEl = document.createElement('OPTION');
      tempOptionEl.textContent = i;
      tempOptionEl.value = i;

      if (i === currentYear) {
        tempOptionEl.selected = 'selected';
      }

      selectEl.appendChild(tempOptionEl);
    }
  };

  /**
   * Update the filter table entry.
   *
   * @param {Number} row Row index.
   * @param {Number} column Column index.
   * @param {String} value Value for the update.
   */
  this.updateFilterTableEntry = function(row, column, value) {
    document.querySelector('#filter tbody tr:nth-child(' + parseInt(row + 1, 10) + ') td:nth-child(' + parseInt(column + 1, 10) + ')').innerHTML = value;
  };

  /**
   * Collapse all collapsible headers in the chart.
   */
  this.collapseTheChart = function() {
    this.chartInstance.getPlugin('collapsibleColumns').collapseAll();
  };

  /**
   * Expand all collapsible headers in the chart.
   */
  this.expandTheChart = function() {
    this.chartInstance.getPlugin('collapsibleColumns').expandAll();
  };

  /**
   * Source Handsontable instance's afterChange hook callback.
   *
   * @param {Array} changes List of changes.
   * @param {String} source Change source.
   */
  function onSourceChange(changes, source) {
    var row, col, oldValue, newValue;

    for (var i = 0; i < changes.length; i++) {
      row = changes[i][0];
      col = changes[i][1];
      oldValue = changes[i][2];
      newValue = changes[i][3];

      this.updateFilterTableEntry(row, col, newValue);
      this.clearTheFilterModal();
      this.fillTheFilterModal(this.vendorColumn, this.formatColumn, this.marketColumn);
    }
  }

  this.onYearSelectChange = function(event) {
    this.chartInstance.getPlugin('ganttChart').setYear(parseInt(event.target.value,10));
  };

  function onSourceSort(column, order) {
    _this.fillTheFilterTable();
  }
}