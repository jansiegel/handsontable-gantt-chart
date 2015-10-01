var hot,
  source;
document.addEventListener('DOMContentLoaded', function() {

  var monthList = [
    {name: 'January', days: 31},
    {name: 'February', days: 28},
    {name: 'March', days: 31},
    {name: 'April', days: 30},
    {name: 'May', days: 31},
    {name: 'June', days: 30},
    {name: 'July', days: 31},
    {name: 'August', days: 31},
    {name: 'September', days: 30},
    {name: 'October', days: 31},
    {name: 'November', days: 30},
    {name: 'December', days: 31}
  ];

  function generateMonthHeaders() {
    var headers = [];
    for (var month in monthList) {
      month = parseInt(month, 10);
      if (monthList.hasOwnProperty(month)) {
        headers.push({
          label: monthList[month].name,
          colspan: monthList[month].days
        });
      }
    }

    return headers;
  }

  function generateDayHeaders() {
    var headers = [];
    for (var month in monthList) {
      month = parseInt(month, 10);
      if (monthList.hasOwnProperty(month)) {
        for (var i = 0; i < monthList[month].days; i++) {
          headers.push(i + 1);
        }
      }
    }

    return headers;
  }

  function generateEmptyData(rows, cols) {
    var data = [];
    var row;

    for (var i = 0; i < rows; i++) {
      row = [];
      for (var j = 0; j < cols; j++) {
        row.push('');
      }
      data.push(row);
    }

    return data;
  }

  var hotContainer = document.querySelector('#hot');
  hot = new Handsontable(hotContainer, {
    data: generateEmptyData(20, 365),
    ganttChart: {
      firstWeekDay: 'monday'
    },
    height: 500
  });


  var sourceHotContainer = document.querySelector('#source');
  source = new Handsontable(sourceHotContainer, {
    data: [
      ["Vendor One", "Posters", "New York, NY", "2", "1/5/2015", "1/20/2015"],
      ["Vendor Two", "Malls", "Los Angeles, CA", "1", "1/11/2015", "1/29/2015"]
    ],
    minRows: 10,
    minCols: 10,
    colHeaders: true,
    stretchH: 'all',
    columns: [
      {
        title: 'Vendor',
        type: 'autocomplete',
        source: ['Vendor One', 'Vendor Two'],
        strict: true
      }, {
        title: 'Format',
        type: 'autocomplete',
        source: ['Posters', 'Malls'],
        strict: true
      }, {
        title: 'Market',
        type: 'autocomplete',
        source: ['New York, NY', 'Los Angeles, CA'],
        strict: true
      },{
        title: 'Size',
        allowInvalid: true
      },{
        title: 'Start Date',
        type: 'date',
        dateFormat: 'M/D/YYYY'
      }, {
        title: 'End Date',
        type: 'date',
        dateFormat: 'M/D/YYYY'
      },
      //{
      //  title: '# of Cycles',
      //  type: 'numeric',
      //  format: '0,0.0[000]'
      //}, {
      //  title: 'Cycle Type',
      //  type: 'autocomplete',
      //  source: ['month', '1-week', '4-week', 'days', 'hours'],
      //  strict: true
      //}
    ],
    xautoColumnSize: true
  });

  source.render();

  hot.getPlugin('ganttChart').connectToHOTInstance(source, 4, 5, {
    vendor: 0,
    format: 1,
    market: 2
  });

});
