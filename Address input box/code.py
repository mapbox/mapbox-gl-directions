"""Smopy: OpenStreetMap image tiles in Python.

Give a box in geographical coordinates (latitude/longitude) and a zoom level,
Smopy returns an OpenStreetMap tile image!

"""
# -----------------------------------------------------------------------------
# Imports
# -----------------------------------------------------------------------------
from __future__ import print_function

from six import BytesIO
from six.moves.urllib.request import urlopen, Request

from PIL import Image
import numpy as np
import matplotlib.pyplot as plt


# -----------------------------------------------------------------------------
# Constants
# -----------------------------------------------------------------------------
__version__ = '0.0.8'


# -----------------------------------------------------------------------------
# OSM functions
# -----------------------------------------------------------------------------
def get_url(x, y, z, tileserver):
    """Return the URL to the image tile (x, y) at zoom z."""
    return tileserver.format(z=z, x=x, y=y)


def fetch_tile(x, y, z, tileserver):
    """Fetch tile (x, y) at zoom level z from OpenStreetMap's servers.

    Return a PIL image.

    """

    url = get_url(x, y, z, tileserver)
    req = Request(url, data=None, headers={'User-Agent': 'smopy'})
    png = BytesIO(urlopen(req).read())
    img = Image.open(png)
    img.load()
    return img


def fetch_map(box, z, tileserver, tilesize, maxtiles, tms=False):
    """Fetch OSM tiles composing a box at a given zoom level, and
    return the assembled PIL image."""
    box = correct_box(box, z)
    x0, y0, x1, y1 = box
    sx, sy = get_box_size(box)
    if sx * sy >= maxtiles:
        raise Exception(("You are requesting a very large map, beware of "
                         "OpenStreetMap tile usage policy "
                         "(http://wiki.openstreetmap.org/wiki/Tile_usage_policy)."))
    img = Image.new('RGB', (sx*tilesize, sy*tilesize))
    for x in range(x0, x1 + 1):
        for y in range(y0, y1 + 1):
            px, py = tilesize * (x - x0), tilesize * (y - y0)
            if tms:
                y = (2 ** z) - y - 1
            img.paste(fetch_tile(x, y, z, tileserver), (px, py))
    return img


def correct_box(box, z):
    """Get good box limits"""
    x0, y0, x1, y1 = box
    new_x0 = max(0, min(x0, x1))
    new_x1 = min(2**z - 1, max(x0, x1))
    new_y0 = max(0, min(y0, y1))
    new_y1 = min(2**z - 1, max(y0, y1))

    return (new_x0, new_y0, new_x1, new_y1)


def get_box_size(box):
    """Get box size"""
    x0, y0, x1, y1 = box
    sx = abs(x1 - x0) + 1
    sy = abs(y1 - y0) + 1
    return (sx, sy)


def determine_scale(latitude, z):
    """Determine the amount of meters per pixel

    :param latitude: latitude in radians
    :param z: zoom level

    Source: http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Resolution_and_Scale

    """
    # For zoom = 0 at equator
    meter_per_pixel = 156543.03

    resolution = meter_per_pixel * np.cos(latitude) / (2 ** z)

    return resolution


# -----------------------------------------------------------------------------
# Utility imaging functions
# -----------------------------------------------------------------------------
def image_to_png(img):
    """Convert a PIL image to a PNG binary string."""
    exp = BytesIO()
    img.save(exp, format='png')
    exp.seek(0)
    s = exp.read()
    exp.close()
    return s


def image_to_numpy(img):
    """Convert a PIL image to a NumPy array."""
    return np.array(img)


# -----------------------------------------------------------------------------
# Functions related to coordinates
# -----------------------------------------------------------------------------
def deg2num(latitude, longitude, zoom, do_round=True):
    """Convert from latitude and longitude to tile numbers.

    If do_round is True, return integers. Otherwise, return floating point
    values.

    Source: http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Python

    """
    lat_rad = np.radians(latitude)
    n = 2.0 ** zoom
    if do_round:
        f = np.floor
    else:
        f = lambda x: x
    xtile = f((longitude + 180.) / 360. * n)
    ytile = f((1.0 - np.log(np.tan(lat_rad) + (1 / np.cos(lat_rad))) / np.pi) /
              2. * n)
    if do_round:
        if isinstance(xtile, np.ndarray):
            xtile = xtile.astype(np.int32)
        else:
            xtile = int(xtile)
        if isinstance(ytile, np.ndarray):
            ytile = ytile.astype(np.int32)
        else:
            ytile = int(ytile)
    return (xtile, ytile)


def num2deg(xtile, ytile, zoom):
    """Convert from x and y tile numbers to latitude and longitude.

    Source: http://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Python

    """
    n = 2.0 ** zoom
    longitude = xtile / n * 360. - 180.
    latitude = np.degrees(np.arctan(np.sinh(np.pi * (1 - 2 * ytile / n))))

    return (latitude, longitude)


def get_tile_box(box_latlon, z):
    """Convert a box in geographical coordinates to a box in
    tile coordinates (integers), at a given zoom level.

    box_latlon is lat0, lon0, lat1, lon1.

    """
    lat0, lon0, lat1, lon1 = box_latlon
    x0, y0 = deg2num(lat0, lon0, z)
    x1, y1 = deg2num(lat1, lon1, z)
    return (x0, y0, x1, y1)


def get_tile_coords(lat, lon, z):
    """Convert geographical coordinates to tile coordinates (integers),
    at a given zoom level."""
    return deg2num(lat, lon, z, do_round=False)


def _box(*args):
    """Return a tuple (lat0, lon0, lat1, lon1) from a coordinate box that
    can be specified in multiple ways:

    A. box((lat0, lon0))  # nargs = 1
    B. box((lat0, lon0, lat1, lon1))  # nargs = 1
    C. box(lat0, lon0)  # nargs = 2
    D. box((lat0, lon0), (lat1, lon1))  # nargs = 2
    E. box(lat0, lon0, lat1, lon1)  # nargs = 4

    """
    nargs = len(args)
    assert nargs in (1, 2, 4)
    pos1 = None

    # Case A.
    if nargs == 1:
        assert hasattr(args[0], '__len__')
        pos = args[0]
        assert len(pos) in (2, 4)
        if len(pos) == 2:
            pos0 = pos
        elif len(pos) == 4:
            pos0 = pos[:2]
            pos1 = pos[2:]

    elif nargs == 2:
        # Case C.
        if not hasattr(args[0], '__len__'):
            pos0 = args[0], args[1]
        # Case D.
        else:
            pos0, pos1 = args[0], args[1]

    # Case E.
    elif nargs == 4:
        pos0 = args[0], args[1]
        pos1 = args[2], args[3]

    if pos1 is None:
        pos1 = pos0

    return (pos0[0], pos0[1], pos1[0], pos1[1])


def extend_box(box_latlon, margin=.1):
    """Extend a box in geographical coordinates with a relative margin."""
    (lat0, lon0, lat1, lon1) = box_latlon
    lat0, lat1 = min(lat0, lat1), max(lat0, lat1)
    lon0, lon1 = min(lon0, lon1), max(lon0, lon1)
    dlat = max((lat1 - lat0) * margin, 0.0005)
    dlon = max((lon1 - lon0) * margin, 0.0005 / np.cos(np.radians(lat0)))
    return (
        max(lat0 - dlat, -80),
        max(lon0 - dlon, -180),
        min(lat1 + dlat, 80),
        min(lon1 + dlon, 180),
    )


# -----------------------------------------------------------------------------
# Main Map class
# -----------------------------------------------------------------------------
class Map(object):

    """Represent an OpenStreetMap image.

    Initialized as:

        map = Map((lat_min, lon_min, lat_max, lon_max), z=z, tileserver="")

    where the first argument is a box in geographical coordinates, and z
    is the zoom level (from minimum zoom 1 to maximum zoom 19).

    Methods:

    * To create a matplotlib plot: `ax = map.show_mpl()`.

    * To save a PNG: `map.save_png(filename)`.

    Tested tileservers:

    * https://tile.openstreetmap.org/{z}/{x}/{y}.png [default]

    * http://a.tile.stamen.com/toner/{z}/{x}/{y}.png [stamen toner (b/w high contrast)]

    * http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.png [watercolor look]

    * https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png [grayscale]


    """

    def __init__(self, *args, **kwargs):
        """Create and fetch the map with a given box in geographical
        coordinates.

        Can be called with `Map(box, z=z)` or `Map(lat, lon, z=z, tileserver="https://tile.openstreetmap.org/{z}/{x}/{y}.png")`.

        """
        z = kwargs.get('z', 18)
        margin = kwargs.get('margin', .05)

        self.tileserver = kwargs.get('tileserver', 'https://tile.openstreetmap.org/{z}/{x}/{y}.png')
        if self.tileserver == '':
            self.tileserver = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'    # fixes situation where some sends an empty string for tileserver
        self.tilesize = kwargs.get('tilesize', 256)
        self.maxtiles = kwargs.get('maxtiles', 16)
        self.verbose = kwargs.get('verbose', True)    # set this to false for suppressing print() outputs
        self.tms = kwargs.get('tms', False)

        box = _box(*args)
        if margin is not None:
            box = extend_box(box, margin)
        self.box = box

        self.z = self.get_allowed_zoom(z)
        if z > self.z:
            if self.verbose:
                print('Lowered zoom level to keep map size reasonable. '
                      '(z = %d)' % self.z)
        else:
            self.z = z
        self.box_tile = get_tile_box(self.box, self.z)

        self.xmin = min(self.box_tile[0], self.box_tile[2])
        self.ymin = min(self.box_tile[1], self.box_tile[3])
        self.img = None
        self.fetch()

    def to_pixels(self, lat, lon=None):
        """Convert from geographical coordinates to pixels in the image."""
        return_2D = False
        if lon is None:
            if isinstance(lat, np.ndarray):
                assert lat.ndim == 2
                assert lat.shape[1] == 2
                lat, lon = lat.T
                return_2D = True
            else:
                lat, lon = lat
        x, y = get_tile_coords(lat, lon, self.z)
        px = (x - self.xmin) * self.tilesize
        py = (y - self.ymin) * self.tilesize
        if return_2D:
            return np.c_[px, py]
        else:
            return px, py

    def get_allowed_zoom(self, z=18):
        box_tile = get_tile_box(self.box, z)
        box = correct_box(box_tile, z)
        sx, sy = get_box_size(box)
        if sx * sy >= self.maxtiles:
            z = self.get_allowed_zoom(z - 1)
        return z

    def fetch(self):
        """Fetch the image from OSM's servers."""
        if self.img is None:
            self.img = fetch_map(self.box_tile, self.z, self.tileserver, self.tilesize, self.maxtiles, self.tms)
        self.w, self.h = self.img.size
        return self.img

    def show_mpl(self, ax=None, figsize=None, dpi=None, **imshow_kwargs):
        """Show the image in matplotlib.

        Parameters
        ----------
        ax : matplotlib axes, optional
            Matplotlib axes used to show the image.  If `None`, a
            a new figure is created.  Default is `None`.
        figsize, dpi : optional
            These arguments are passed as arguments for the created
            figure if `ax` is `None`.  Default is `None` for both
            parameters.
        **imshow_kwargs : optional
            All remaining keyword arguments are passed to matplotlib
            imshow.
        """
        if not ax:
            plt.figure(figsize=figsize, dpi=dpi)
            ax = plt.subplot(111)
            plt.xticks([])
            plt.yticks([])
            plt.grid(False)
            plt.xlim(0, self.w)
            plt.ylim(self.h, 0)
            plt.axis('off')
            plt.tight_layout()
        ax.imshow(self.img, **imshow_kwargs)
        return ax

    def show_ipython(self):
        """Show the image in IPython as a PNG image."""
        try:
            from IPython.display import display_png
        except ModuleNotFoundError:
            print("Please make sure to install Smopy with: "
                + "pip install smopy[ipython]"
            )
            raise
        png = image_to_png(self.img)
        display_png(png, raw=True)

    def to_pil(self):
        """Return the PIL image."""
        return self.img

    def to_numpy(self):
        """Return the image as a NumPy array."""
        return image_to_numpy(self.img)

    def save_png(self, filename):
        """Save the image to a PNG file."""
        png = image_to_png(self.img)
        with open(filename, 'wb') as f:
            f.write(png)