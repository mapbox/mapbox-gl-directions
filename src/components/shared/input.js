import React, { Component, PropTypes } from 'react';
import AutoSuggest from 'react-autosuggest';

export default class Input extends Component {

  constructor(props) {
    super(props);
    this.state = {
      activeSuggestion: props.value
    };
  }

  onChange(text) {
    this.setState({ activeSuggestion: text });
    if (text) this.props.onChange(text);
  }

  componentWillReceiveProps(props) {
    if (props.refreshValue) {

      console.log('gets here', props.refreshValue);
      this.setState({ activeSuggestion: props.value });
    }
  }

  clearQuery() {
    this.setState({ activeSuggestion: '' });
    React.findDOMNode(this.refs.autosuggest.refs.input).focus();
    this.props.onClear();
  }

  suggestionValue(result) {
    this.setState({ activeSuggestion: result.place_name });
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
          inputAttributes={{
            placeholder: placeholder,
            onChange: this.onChange.bind(this)
          }}
          ref='autosuggest'
          suggestions={this.getSuggestions.bind(this)}
          suggestionRenderer={suggestions}
          suggestionValue={this.suggestionValue.bind(this)}
          value={this.state.activeSuggestion}
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
  refreshValue: PropTypes.bool,
  onClear: PropTypes.func,
  onFeature: PropTypes.func.isRequired,
  results: PropTypes.array.isRequired,
  value: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired
};
