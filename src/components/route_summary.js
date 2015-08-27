import React, { Component, PropTypes } from 'react';
import format from '../format';

export default class Routes extends Component {

  render() {
    const { data, unit, routeIndex } = this.props;
    const route = data[routeIndex];

    return (
      <div className='mapbox-directions-component mapbox-directions-route-summary'>
        <div>
          <label>{`Route ${routeIndex + 1}`}</label>
          <h1>{`${format.duration(route.duration)}`}</h1>
          <span>{`${format[unit](route.distance)}`}</span>
        </div>
      </div>
    );
  }
}

Routes.propTypes = {
  unit: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  routeIndex: PropTypes.number.isRequired
};
