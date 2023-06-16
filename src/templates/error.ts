export function createErrorTemplate(error: unknown) {
  return `
<div class='directions-control directions-control-directions'>
  <div class='mapbox-directions-error'>
    ${error}
  </div>
</div>
`;
}
