// Import modules
import React from 'react'
import PropTypes from 'prop-types'
import './css/toggles.css'

class Toggles extends React.Component {
  constructor(props) {
    super(props)

    this.handleToggleClick = this.handleToggleClick.bind(this)
  }

  handleToggleClick({ target: { value } }) {
    const { handleColumnToggle } = this.props
    handleColumnToggle(value)
  }

  isColumnVisible(key) {
    const { colProperties } = this.props
    const thisColProps = colProperties[key]
    return !thisColProps || !thisColProps.invisible
  }
  isColumnHidden(key) {
    const { colProperties } = this.props
    const thisColProps = colProperties[key]
    return !thisColProps || !thisColProps.isHidden
  }

  renderToggles() {
    const { columns } = this.props
    return columns.map(column => (
      this.isColumnHidden(column.key)?(<span
        className='rsdt rsdt-column-toggles toggle'
        key={column.key}
      >
        <label htmlFor={column.key}>
          <input
            type='checkbox'
            id={column.key}
            value={column.key}
            name={column.text}
            checked={this.isColumnVisible(column.key)}
            onChange={this.handleToggleClick}
          />
          {column.text}
        </label>
      </span>):null
    ))
  }

  render() {
    return (
      <div id='rsdt-toggles' className='rsdt rsdt-column-toggles'>
        {this.renderToggles()}
      </div>
    )
  }
}

/* Defines the type of data expected in each passed prop */
Toggles.propTypes = {
  columns: PropTypes.array.isRequired,
  colProperties: PropTypes.object,
  handleColumnToggle: PropTypes.func.isRequired,
}

export default Toggles
