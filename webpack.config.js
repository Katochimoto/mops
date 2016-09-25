var path = require('path');
var webpack = require('webpack');
var merge = require('lodash/merge');

var srcPath = path.join(__dirname, 'src');
var distPath = path.join(__dirname, 'dist');
var isDev = (process.env.NODE_ENV === 'development');
var nodeEnv = isDev ? 'development' : 'production';
var preprocessParams = '?+LODASH&NODE_ENV=' + nodeEnv;
var preprocessParamsCompact = '?+NOLODASH&NODE_ENV=' + nodeEnv;

if (isDev) {
    distPath = path.join(__dirname, 'samples', 'dist');
    preprocessParams = '?+DEBUG&+LODASH&NODE_ENV=' + nodeEnv;
    preprocessParamsCompact = '?+DEBUG&+NOLODASH&NODE_ENV=' + nodeEnv;
}

var params = {
    'debug': isDev,
    'devtool': isDev ? 'eval' : undefined,
    'target': 'web',
    'entry': {
        'mops': './mops.js'
    },
    'context': srcPath,
    'output': {
        'filename': '[name].js',
        'library': '[name]',
        'libraryTarget': 'umd',
        'path': distPath
    },
    'module': {
        'preLoaders': [
            {
                'test': /\.js$/,
                'loader': 'eslint!preprocess' + preprocessParams,
                'include': [ srcPath ]
            }
        ],
        'loaders': [
            {
                'test': /\.js$/,
                'loader': 'babel!preprocess' + preprocessParams,
                'include': [ srcPath ]
            }
        ]
    }
};

var paramsCompact = merge({}, params, {
    'output': {
        'filename': '[name]-compact.js',
    },
    'externals': {
        'lodash': {
            'root': '_',
            'commonjs2': 'lodash',
            'commonjs': 'lodash',
            'amd': 'lodash'
        }
    },
    'module': {
        'preLoaders': [
            {
                'test': /\.js$/,
                'loader': 'eslint!preprocess' + preprocessParamsCompact,
                'include': [ srcPath ]
            }
        ],
        'loaders': [
            {
                'test': /\.js$/,
                'loader': 'babel!preprocess' + preprocessParamsCompact,
                'include': [ srcPath ]
            }
        ]
    }
});

var runs = [
    params,
    paramsCompact
];

if (!isDev) {
    runs.push(merge({}, params, {
        'output': {
            'filename': '[name].min.js',
        },
        'plugins': [
            new webpack.optimize.UglifyJsPlugin({
                'output': {
                    'comments': false
                },
                'compress': {
                    'warnings': false
                }
            })
        ],
        'devtool': '#source-map'
    }));

    runs.push(merge({}, paramsCompact, {
        'output': {
            'filename': '[name]-compact.min.js',
        },
        'plugins': [
            new webpack.optimize.UglifyJsPlugin({
                'output': {
                    'comments': false
                },
                'compress': {
                    'warnings': false
                }
            })
        ],
        'devtool': '#source-map'
    }));
}

module.exports = runs;
