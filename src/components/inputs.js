import React, { Component, PropTypes } from 'react';
import Input from './shared/input';

export default class Inputs extends Component {

  constructor() {
    super();
  }

  onInputChange(value) {
    var { queryOrigin } = this.props;
    queryOrigin(value);
  }

  render() {
    const { inputs } = this.props;

    return (
      <div className='mapbox-directions-component mapbox-directions-inputs'>
        <Input
          onChange={this.onInputChange.bind(this)}
          results={inputs.results}
          options={{
            mode: 'origin',
            placeholder: 'start',
            value: inputs.origin,
            icon: 'depart'
          }}
        />
        <span className='directions-icon directions-icon-reverse directions-reverse' title='Reverse origin &amp; destination'></span>
        <Input
          onChange={this.onInputChange.bind(this)}
          results={inputs.results}
          options={{
            mode: 'destination',
            placeholder: 'end',
            value:  inputs.destination,
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
  inputs: PropTypes.object.isRequired
};
