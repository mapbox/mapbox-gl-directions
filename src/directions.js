// import App from './containers';

export default class Directions extends mapboxgl.Control {

  constructor(options) {
    super();

    this.options = {
      mode: 'driving',
      unit: 'imperial'
    };

    mapboxgl.util.setOptions(this, options);
  }

  onAdd(map) {
    var id = this.options.container;
    var container = typeof id === 'string' ?
      document.getElementById(id) : id;

    // React.render(<App options={this.options} map={map} />, container);
  }
}
