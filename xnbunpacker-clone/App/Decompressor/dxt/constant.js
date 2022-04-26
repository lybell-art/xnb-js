//constant values
const kDxt1 = ( 1 << 0 ); //! Use DXT1 compression.
const kDxt3 = ( 1 << 1 ); //! Use DXT3 compression.
const kDxt5 = ( 1 << 2 ); //! Use DXT5 compression.
const kColourIterativeClusterFit = ( 1 << 8 ); //! Use a very slow but very high quality colour compressor.
const kColourClusterFit = ( 1 << 3 ); //! Use a slow but high quality colour compressor (the default).
const kColourRangeFit = ( 1 << 4 ); //! Use a fast but low quality colour compressor.
const kColourMetricPerceptual = ( 1 << 5 ); //! Use a perceptual metric for colour error (the default).
const kColourMetricUniform = ( 1 << 6 ); //! Use a uniform metric for colour error.
const kWeightColourByAlpha = ( 1 << 7 );  //! Weight the colour by alpha during cluster fit (disabled by default).

export {kDxt1,
    kDxt3,
    kDxt5,
    kColourIterativeClusterFit,
    kColourClusterFit,
    kColourRangeFit,
    kColourMetricPerceptual,
    kColourMetricUniform,
    kWeightColourByAlpha
};