import React, { Component, PropTypes } from 'react';
import format from '../format';

export default class Instructions extends Component {

  _mouseOver(coordinates) {
    const { hoverMarker } = this.props;
    if (coordinates) hoverMarker(coordinates);
  }

  _mouseOut(coordinates) {
    const { hoverMarker } = this.props;
    if (coordinates) hoverMarker(null);
  }

  _onClick(coordinates) {
    // Zoom to point on map
    const { map } = this.props;
    map.flyTo({ center: coordinates });
  }

  render() {
    const { data, unit, routeIndex } = this.props;
    const steps = data[routeIndex].steps;

    const renderSteps = function(d, i) {
      const icon = d.maneuver.type.replace(/\s+/g, '-').toLowerCase();
      const distance = (d.distance) ? format[unit](d.distance) : false;
      const coordinates = d.maneuver.location.coordinates;

      return (
        <li
          key={i}
          onMouseOver={this._mouseOver.bind(this, coordinates)}
          onMouseOut={this._mouseOut.bind(this, coordinates)}
          onClick={this._onClick.bind(this, coordinates)}
          className='mapbox-directions-step'>
          <span className={`directions-icon directions-icon-${icon}`}></span>
          <div className={`mapbox-directions-step-maneuver`}>
            {d.maneuver.instruction}
          </div>
          {distance && <div className={`mapbox-directions-step-distance`}>
            {distance}
          </div>}
        </li>
      );
    }.bind(this);

    return (
      <div className='mapbox-directions-instructions'>
        <ol className='mapbox-directions-steps'>
          {steps.map(renderSteps)}
        </ol>
      </div>
    );
  }
}

Instructions.propTypes = {
  map: PropTypes.object.isRequired,
  unit: PropTypes.string.isRequired,
  data: PropTypes.array.isRequired,
  routeIndex: PropTypes.number.isRequired,
  hoverMarker: PropTypes.func.isRequired
};
