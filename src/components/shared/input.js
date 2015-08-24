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
    this.props.onFeature(result.center);
  }

  render() {
    const { placeholder, value } = this.props;
    const inputAttributes = {
      placeholder: placeholder,
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
      <div>
        <AutoSuggest
          ref='autosuggest'
          inputAttributes={inputAttributes}
          suggestions={this.getSuggestions.bind(this)}
          suggestionRenderer={suggestions}
          suggestionValue={this.suggestionValue.bind(this)}
          onSuggestionSelected={this.setResult.bind(this)}
        />

        {value && <button
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
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired
};
