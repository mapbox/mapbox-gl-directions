import turfLineString from 'turf-linestring';
import turfLineDistance from 'turf-line-distance';

/* Given an array of features, return
 * an array of their coordinates
 * ordered by the shortest path that visits
 * all points (AKA Travelling Salesman algorithm)
 *
 * @param {Object} feature An array of marker objects
 * @returns {Array} An array of array coordinates
 */
export default function travelingBrute(features) {

  const coords = features.map((feature) => {
    return feature.geometry.coordinates;
  });

  const permutations = permutator(coords);
  let min = turfLineString([], { distance: Infinity });

  permutations.forEach(function(permutation){
    const line = turfLineString(permutation);
    line.properties.distance = turfLineDistance(line);
    if (line.properties.distance < min.properties.distance) min = line;
  });

  return min.geometry.coordinates;
}

function permutator(inputArr) {
  var results = [];

  function permute(arr, memo) {
    let cur;
    memo = memo || [];

    for (var i = 0; i < arr.length; i++) {
      cur = arr.splice(i, 1);
      if (arr.length === 0) {
        results.push(memo.concat(cur));
      }
      permute(arr.slice(), memo.concat(cur));
      arr.splice(i, 0, cur[0]);
    }

    return results;
  }

  return permute(inputArr);
}
