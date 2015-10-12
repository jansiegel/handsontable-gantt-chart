var hot,
  source;
document.addEventListener('DOMContentLoaded', function() {
  var sourceHotContainer = document.querySelector('#source');
  source = new Handsontable(sourceHotContainer, {
    data: [
      ['Vendor One', 'Posters', 'New York, NY', '2', '1/5/2015', '1/20/2015'],
      ['Vendor Two', 'Malls', 'Los Angeles, CA', '1', '1/11/2015', '1/29/2015'],
      ['Vendor Three', 'Posters', 'Chicago, IL', '2', '1/15/2015', '2/20/2015'],
      ['Vendor Four', 'Malls', 'Philadelphia, PA', '1', '1/3/2015', '3/29/2015'],
      ['Vendor One', 'Posters', 'San Francisco, CA', '2', '4/5/2015', '4/20/2015'],
      ['Vendor Four', 'Malls', 'Los Angeles, CA', '1', '2/11/2015', '5/29/2015'],
      ['Vendor Two', 'Posters', 'New York, NY', '2', '2/15/2015', '3/20/2015'],
      ['Vendor Two', 'Malls', 'Los Angeles, CA', '1', '3/2/2015', '4/12/2015'],
    ],
    minRows: 10,
    minCols: 10,
    colHeaders: true,
    stretchH: 'all',
    columns: [
      {
        title: 'Vendor',
        type: 'autocomplete',
        source: ['Vendor One', 'Vendor Two', 'Vendor Three', 'Vendor Four', 'Vendor Five', 'Vendor Six', 'Vendor Seven', 'Vendor Eight'],
        strict: true
      }, {
        title: 'Format',
        type: 'autocomplete',
        source: ['Posters', 'Malls'],
        strict: true
      }, {
        title: 'Market',
        type: 'autocomplete',
        source: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Philadelphia, PA', 'San Francisco, CA', 'Dallas, TX', 'Atlanta, GA', 'Houston, TX', 'Phoenix, AZ', 'Detroit, MI', 'Seattle, WA'],
        strict: true
      }, {
        title: 'Size',
        allowInvalid: true
      }, {
        title: 'Start Date',
        type: 'date',
        dateFormat: 'M/D/YYYY'
      }, {
        title: 'End Date',
        type: 'date',
        dateFormat: 'M/D/YYYY'
      },
    ]
  });

  var filterChartController = new FilterChart(source);
  filterChartController.fillTheFilterTable();
  filterChartController.fillTheFilterModal(0, 1, 2);

  var hotContainer = document.querySelector('#hot');
  var hotContainerParentWidth = hotContainer.parentNode.offsetWidth;
  var filterPanelHeight = document.querySelector('#filter').offsetHeight;
  hot = new Handsontable(hotContainer, {
    colHeaders: true,
    hiddenRows: true,
    rowHeights: 26,
    ganttChart: {
      firstWeekDay: 'monday',
      startYear: 2015
    },
    disableVisualSelection: true,
    height: filterPanelHeight + Handsontable.Dom.getScrollbarWidth() + 42,
    width: hotContainerParentWidth - 20
  });

  hot.getPlugin('ganttChart').connectToHOTInstance(source, 4, 5, {
    vendor: 0,
    format: 1,
    market: 2
  });

  filterChartController.setChartInstance(hot);
  filterChartController.positionTableWithChart();
  filterChartController.bindEvents();
});
