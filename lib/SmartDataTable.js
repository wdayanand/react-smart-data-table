// Import modules
import React from 'react'
import PropTypes from 'prop-types'
// Import components
import ErrorBoundary from './ErrorBoundary'
import TableCell from './TableCell'
import Toggles from './Toggles'
import Paginate from './Paginate'
// Import functions
import {
  debugPrint, errorPrint, fetchData, parseDataForColumns, parseDataForRows,
  sliceRowsPerPage, sortData, isEmpty, isString, isFunction,
} from './helpers/functions'
// Import styles
import './css/basic.css'
import { Scrollbars } from 'react-custom-scrollbars'
import { Image } from 'semantic-ui-react'

import filter1 from './assets/images/filter1.png'
import filter2 from './assets/images/filter2.png'
import filter3 from './assets/images/filter3.png'
import filterDropDownIcon from './assets/images/droptable_icon.png'

class SmartDataTablePlain extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      asyncData: [],
      columns: [],
      colProperties: {},
      sorting: this.props.sorting ? this.props.sorting : {
        key: '',
        dir: '',
      },
      currentPage: 1,
      isLoading: false,
    }

    this.handleColumnToggle = this.handleColumnToggle.bind(this)
    this.handleOnPageClick = this.handleOnPageClick.bind(this)
    this.handleRowClick = this.handleRowClick.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    const { filterValue } = props
    const { prevFilterValue } = state
    if (filterValue !== prevFilterValue) {
      return {
        currentPage: 1,
        prevFilterValue: filterValue,
      }
    }
    return null
  }

  componentDidMount() {
    this.showWarnings()
    this.fetchData()
    this.setColProperties()
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props
    const { data: prevData } = prevProps
    if (isString(data) && (typeof data !== typeof prevData || data !== prevData)) {
      this.fetchData()
    }
  }

  setColProperties() {
    const { headers } = this.props
    this.setState({ colProperties: headers })
  }

  fetchData() {
    const { data, dataKey } = this.props
    if (isString(data)) {
      this.setState({ isLoading: true })
      fetchData(data, dataKey)
        .then((asyncData) => {
          this.setState({
            asyncData,
            isLoading: false,
            columns: this.getColumns(true),
          })
        })
        .catch(debugPrint)
    }
  }

  showWarnings() {
    const { footer, withHeaders } = this.props
    const propError = (oldName, newName) => `
[SmartDataTable] The '${oldName}' prop has been deprecated in v0.6 and is no
longer valid. Consider replacing it with '${newName}'
`
    if (footer) errorPrint(propError('footer', 'withFooter'))
    if (withHeaders) errorPrint(propError('withHeaders', 'withHeader'))
  }

  handleRowClick(event, rowData, rowIndex, tableData) {
    const { onRowClick } = this.props
    if (onRowClick) {
      onRowClick(event, { rowData, rowIndex, tableData })
    }
  }

  handleColumnToggle(key) {
    const { colProperties } = this.state
    if (!colProperties[key]) {
      colProperties[key] = {}
    }
    colProperties[key].invisible = !colProperties[key].invisible
    this.setState({ colProperties })
  }

  handleOnPageClick(nextPage) {
    this.setState({ currentPage: nextPage })
  }

  handleSortChange(column) {
    const { sorting } = this.state
    const { onHeaderIconClick } = this.props
    const { key } = column
    let dir = ''
    if (key !== sorting.key) sorting.dir = ''
    if (sorting.dir) {
      if (sorting.dir === 'ASC') {
        dir = 'DESC'
      } else {
        dir = ''
      }
    } else {
      dir = 'ASC'
    }
    this.setState({
      sorting: {
        key,
        dir,
      },
    })

    if (onHeaderIconClick) {
      onHeaderIconClick({
        key,
        dir,
      });
    }

  }

  handleFilter(column) {
    const { sorting } = this.state
    const { onHeaderIconClick } = this.props
    if (onHeaderIconClick) {
      onHeaderIconClick(sorting);
    }

  }

  renderSorting(column) {
    const { sorting: { key, dir } } = this.state
    let sortingIcon = filter2
    if (key === column.key) {
      if (dir) {
        if (dir === 'ASC') {
          sortingIcon = filter1
        } else {
          sortingIcon = filter3
        }
      }
    }
    return (
      <Image className='drop_tableicon' src={sortingIcon}
        onClick={() => this.handleSortChange(column)}
        onKeyDown={() => this.handleSortChange(column)} />

    )
  }

  renderFilterAble(column) {

    return (
      <Image className='drop_tableicon' src={filterDropDownIcon}
        onClick={() => this.handleFilter(column)}
        onKeyDown={() => this.handleFilter(column)} />

    )
  }

  renderHeader(columns) {
    const { colProperties } = this.state
    const { sortable } = this.props
    const headers = columns.map((column) => {
      const thisColProps = colProperties[column.key]
      const showCol = !thisColProps || !thisColProps.invisible
      if (showCol) {
        return (
          <th key={column.key}>
            <div>
              <p> {column.text}{sortable && column.sortable ? this.renderSorting(column) : (column.filterable ? this.renderFilterAble(column) : null)}</p>
            </div>

          </th>
        )
      }
      return null
    })
    return (
      <tr>
        {headers}
      </tr>
    )
  }

  renderRow(columns, row, i) {
    const { colProperties } = this.state
    const {
      withLinks, filterValue, parseBool, parseImg,
    } = this.props
    return columns.map((column, j) => {
      const thisColProps = Object.assign({}, colProperties[column.key])
      const showCol = !thisColProps.invisible
      const transformFn = thisColProps.transform
      if (showCol) {
        return (
          <td key={`row-${i}-column-${j}`}>
            {isFunction(transformFn) ? transformFn(row[column.key], i, row) : (
              <ErrorBoundary>
                <TableCell
                  withLinks={withLinks}
                  filterValue={filterValue}
                  parseBool={parseBool}
                  parseImg={parseImg}
                  filterable={thisColProps.filterable}
                  isImg={thisColProps.isImg}
                >
                  {row[column.key]}
                </TableCell>
              </ErrorBoundary>
            )}
          </td>
        )
      }
      return null
    })
  }

  renderBody(columns, rows) {
    const { perPage } = this.props
    const { currentPage } = this.state
    const visibleRows = sliceRowsPerPage(rows, currentPage, perPage)
    const tableRows = visibleRows.map((row, i) => (
      <tr key={`row-${i}`} onClick={e => this.handleRowClick(e, row, i, rows)}>
        {this.renderRow(columns, row, i)}
      </tr>
    ))
    return (
      <Scrollbars className='new_scroller' autoHeight autoHeightMin={0}
        autoHeightMax={560}
        renderTrackVertical={props => <div {...props} className="scrollbar-vertical" />}
        renderThumbVertical={props => <div {...props} className="thumb-vertical" />}>

        <tbody>
          {tableRows}
        </tbody>
      </Scrollbars>
    )
  }

  renderFooter(columns) {
    const { withFooter } = this.props
    return withFooter ? this.renderHeader(columns) : null
  }

  renderToggles(columns) {
    const { colProperties } = this.state
    const { withToggles } = this.props
    return withToggles ? (
      <ErrorBoundary>
        <Toggles columns={columns} colProperties={colProperties} handleColumnToggle={this.handleColumnToggle} />
      </ErrorBoundary>
    ) : null
  }

  renderPagination(rows) {
    const { perPage } = this.props
    const { currentPage } = this.state
    return perPage && perPage > 0 ? (
      <ErrorBoundary>
        <Paginate rows={rows} currentPage={currentPage} perPage={perPage} onPageClick={this.handleOnPageClick} />
      </ErrorBoundary>
    ) : null
  }

  getColumns(force = false) {
    const { asyncData, columns } = this.state
    const { data, headers } = this.props
    if (!force && !isEmpty(columns)) return columns
    if (isString(data)) {
      return parseDataForColumns(asyncData, headers)
    }
    return parseDataForColumns(data, headers)
  }

  getRows() {
    const { asyncData, colProperties, sorting } = this.state
    const { data, filterValue, isLocalSearch } = this.props
    if (isString(data)) {
      return sortData(filterValue, colProperties, sorting, parseDataForRows(asyncData), isLocalSearch)
    }
    return sortData(filterValue, colProperties, sorting, parseDataForRows(data), isLocalSearch)
  }

  render() {
    const {
      name, className, withHeader, loader, dynamic, emptyTable,
    } = this.props
    const { isLoading } = this.state
    const columns = this.getColumns(dynamic)
    const rows = this.getRows()
    if (isEmpty(rows)) return emptyTable
    return !isLoading ? (
      <div className='rsdt rsdt-container'>
        {this.renderToggles(columns)}
        <table data-table-name={name} className={className}>
          {withHeader && (
            <thead>
              {this.renderHeader(columns)}
            </thead>
          )}
          {this.renderBody(columns, rows)}
          <tfoot>
            {this.renderFooter(columns)}
          </tfoot>
        </table>
        {this.renderPagination(rows)}
      </div>
    ) : loader
  }
}

// Defines the type of data expected in each passed prop
SmartDataTablePlain.propTypes = {
  data: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
  ]).isRequired,
  dataKey: PropTypes.string,
  columns: PropTypes.array,
  name: PropTypes.string,
  sortable: PropTypes.bool,
  isLocalSearch: PropTypes.bool,
  withToggles: PropTypes.bool,
  withLinks: PropTypes.bool,
  withHeader: PropTypes.bool,
  withFooter: PropTypes.bool,
  filterValue: PropTypes.string,
  perPage: PropTypes.number,
  className: PropTypes.string,
  loader: PropTypes.node,
  onRowClick: PropTypes.func,
  onHeaderIconClick: PropTypes.func,
  parseBool: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  parseImg: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),
  headers: PropTypes.object,
  dynamic: PropTypes.bool,
  emptyTable: PropTypes.node,
}

// Defines the default values for not passing a certain prop
SmartDataTablePlain.defaultProps = {
  dataKey: 'data',
  columns: [],
  name: 'reactsmartdatatable',
  sortable: false,
  withToggles: false,
  withLinks: false,
  withHeader: true,
  withFooter: false,
  filterValue: '',
  perPage: 0,
  className: '',
  loader: null,
  parseBool: false,
  parseImg: false,
  headers: {},
  dynamic: false,
  emptyTable: null,
}

// Wrap the component with an Error Boundary
const SmartDataTable = props => (
  <ErrorBoundary>
    <SmartDataTablePlain {...props} />
  </ErrorBoundary>
)

export default SmartDataTable
