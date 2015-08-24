import React, { Component, PropTypes } from 'react';
import AutoSuggest from 'react-autosuggest';

export default class Input extends Component {

  constructor(props) {
    super(props);
  }

  onChange(text) {
    if (text) this.props.onChange(text);
  }

  clearQuery() {
    // TODO Clear the state of the input before calling props.
    // this.props.onClear();
  }

  suggestionValue(result) {
    return result.place_name;
  }

  getSuggestions(input, cb) {
    cb(null, this.props.results);
  }

  setResult(result) {
    const { options, onFeature } = this.props;

    onFeature({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: result.center
      },
      properties: {
        id: options.mode,
        'marker-symbol': (options.mode === 'origin') ? 'A' : 'B'
      }
    });
  }

  render() {
    const { options } = this.props;
    const inputAttributes = {
      placeholder: options.placeholder,
      onChange: this.onChange.bind(this)
    };

    const suggestions = function(suggestion) {
      return (
        <div>
          {suggestion.place_name}
        </div>
      );
    };

    return (
      <div className={`mapbox-directions-${options.mode}`}>
        <label className='mapbox-form-label'>
          <span className={`directions-icon directions-icon-${options.icon}`}></span>
        </label>

        <AutoSuggest
          ref='autosuggest'
          inputAttributes={inputAttributes}
          suggestions={this.getSuggestions.bind(this)}
          suggestionRenderer={suggestions}
          suggestionValue={this.suggestionValue.bind(this)}
          onSuggestionSelected={this.setResult.bind(this)}
        />

        {options.value && <button
          onClick={this.clearQuery.bind(this)}
          className='directions-icon directions-icon-close directions-close'
          title='Clear value'>
        </button>}
      </div>
    );
  }
}

Input.propTypes = {
  text: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onFeature: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  options: PropTypes.object.isRequired
};
