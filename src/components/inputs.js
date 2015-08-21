import React, { Component, PropTypes } from 'react';
import Input from './shared/input';

export default class Inputs extends Component {

  constructor() {
    super();
  }

  onOriginChange(v) {
    this.props.queryOrigin(v);
  }

  onDestinationChange(v) {
    this.props.queryDestination(v);
  }

  onDestinationClear() {
    this.props.clearDestination();
  }

  onOriginClear() {
    this.props.clearOrigin();
  }

  reverseInputs() {
    this.props.reverseInputs();
  }

  render() {
    const { inputs } = this.props;

    return (
      <div className='mapbox-directions-component mapbox-directions-inputs'>
        <Input
          onChange={this.onOriginChange.bind(this)}
          onClear={this.onOriginClear.bind(this)}
          results={inputs.originResults}
          options={{
            mode: 'origin',
            placeholder: 'start',
            value: inputs.originQuery,
            icon: 'depart'
          }}
        />

        <button
          className='directions-icon directions-icon-reverse directions-reverse'
          title='Reverse origin &amp; destination'
          onClick={this.reverseInputs.bind(this)}>
        </button>

        <Input
          onChange={this.onDestinationChange.bind(this)}
          onClear={this.onDestinationClear.bind(this)}
          results={inputs.destinationResults}
          options={{
            mode: 'destination',
            placeholder: 'end',
            value: inputs.destinationQuery,
            icon: 'arrive'
          }}
        />

        {this.props.results && <div className='mapbox-directions-profile'>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-driving'
            />
            <label htmlFor='mapbox-directions-profile-driving'>Driving</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-walking'
            />
            <label htmlFor='mapbox-directions-profile-walking'>Walking</label>
          </span>
          <span>
            <input
              type='radio'
              name='profile'
              id='mapbox-directions-profile-cycling'
            />
            <label htmlFor='mapbox-directions-profile-cycling'>Cycling</label>
          </span>
        </div>}
      </div>
    );
  }
}

Inputs.propTypes = {
  queryOrigin: PropTypes.func.isRequired,
  queryDestination: PropTypes.func.isRequired,
  clearOrigin: PropTypes.func.isRequired,
  clearDestination: PropTypes.func.isRequired,
  reverseInputs: PropTypes.func.isRequired,
  inputs: PropTypes.object.isRequired
};
