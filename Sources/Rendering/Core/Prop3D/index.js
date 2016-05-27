import * as macro from '../../../macro';
import vtkBoundingBox from '../../../Common/DataModel/BoundingBox';
import vtkProp from '../Prop';
import { mat4 } from 'gl-matrix';


function notImplemented(method) {
  return () => console.log('vtkProp3D::${method} - NOT IMPLEMENTED');
}

// ----------------------------------------------------------------------------
// vtkProp3D methods
// ----------------------------------------------------------------------------

function vtkProp3D(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkProp3D');

  publicAPI.getMTime = () => Math.max(
    model.mtime,
    publicAPI.getUserTransformMatrixMTime());

  publicAPI.getUserTransformMatrixMTime = () => Math.max(
    model.userMatrix ? model.userMatrix.getMTime() : 0,
    model.userTransform ? model.userTransform.getMTime() : 0);

  publicAPI.addPosition = (deltaXYZ) => {
    model.position = model.position.map((value, index) => value + deltaXYZ[index]);
    publicAPI.modified();
  };

  // FIXME
  publicAPI.setOrientation = notImplemented('setOrientation');
  publicAPI.getOrientation = notImplemented('getOrientation');
  publicAPI.getOrientationWXYZ = notImplemented('GetOrientationWXYZ');
  publicAPI.AddOrientation = notImplemented('AddOrientation');
  publicAPI.RotateX = notImplemented('RotateX');
  publicAPI.RotateY = notImplemented('RotateY');
  publicAPI.RotateZ = notImplemented('RotateZ');
  publicAPI.RotateWXYZ = notImplemented('RotateWXYZ');
  publicAPI.SetUserTransform = notImplemented('SetUserTransform');
  publicAPI.SetUserMatrix = notImplemented('SetUserMatrix');

  publicAPI.getMatrix = () => {
    publicAPI.computeMatrix();
    return model.matrix;
  };

  publicAPI.computeMatrix = notImplemented('computeMatrix');

  // getBounds (macro)

  publicAPI.getCenter = () => vtkBoundingBox.getCenter(model.bounds);
  publicAPI.getLength = () => vtkBoundingBox.getLength(model.bounds);
  publicAPI.getXRange = () => vtkBoundingBox.getXRange(model.bounds);
  publicAPI.getYRange = () => vtkBoundingBox.getYRange(model.bounds);
  publicAPI.getZRange = () => vtkBoundingBox.getZRange(model.bounds);

  publicAPI.pokeMatrix = notImplemented('pokeMatrix');
  publicAPI.getUserMatrix = notImplemented('GetUserMatrix');

  function updateIdentityFlag() {
    if (!model.isIdentity) {
      return;
    }

    [model.origin, model.position, model.orientation].forEach(array => {
      if (model.isIdentity) {
        return;
      }
      if (array.filter(v => v !== 0).length) {
        model.isIdentity = false;
        return;
      }
    });

    // if (model.userMatrix || model.userTransform) {
    //   model.isIdentity = false;
    //   return;
    // }

    if (model.scale.filter(v => v !== 1).length) {
      model.isIdentity = false;
      return;
    }
  }

  publicAPI.onModified(updateIdentityFlag);
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  origin: [0, 0, 0],
  position: [0, 0, 0],
  orientation: [0, 0, 0],
  scale: [1, 1, 1],
  bounds: [1, -1, 1, -1, 1, -1],

  userMatrix: null,
  userTransform: null,

  cachedProp3D: null,
  isIdentity: true,
};

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkProp.extend(publicAPI, model);

  // Build VTK API
  macro.get(publicAPI, model, [
    'bounds',
    'isIdentity',
  ]);
  macro.setGetArray(publicAPI, model, [
    'origin',
    'position',
    'orientation',
    'scale',
  ], 3);

  // Object internal instance
  model.matrix = mat4.create();
  model.transform = null; // FIXME

  // Object methods
  vtkProp3D(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend);

// ----------------------------------------------------------------------------

export default { newInstance, extend };