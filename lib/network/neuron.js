'use strict';

const _ = require('lodash');
const Helper = require('genevolve/network/neuron-config-helper');
const colors = require('colors');


class Neuron {
    constructor(props) {
        this.props = _.assign({numOfInputs: 1, neuronConfig: {}}, props || {});

        this.weightGenerator = this.props.neuronConfig.weightGenerator;
        this.hasBias = this.props.neuronConfig.hasBias;
        this.printPrecision = this.props.neuronConfig.printPrecision;
        this.neuronActivation = this.props.neuronConfig.neuronActivation;

        this.init();
    }

    init() {
        this.weights = _.map(new Array(this.props.numOfInputs), _ => this.weightGenerator());
        this.bias = this.weightGenerator();
        //this.learningRate = 0.1;
    }

    ignite(inputs) {
        if(inputs.length != this.props.numOfInputs) 
            throw new Error('Input count does not match weights count');

        let sum = 0;

        if (this.hasBias) sum = this.bias;
        //Compute dot product of inputs x weights
        for (let i = 0; i < this.props.numOfInputs; i++)
            sum += this.weights[i] * inputs[i];

        this.lastActivation = this.neuronActivation(sum);

        //Output response of the neuron to the provided inputs
        return this.lastActivation;
    }

    getGenome() {
        return {weights: this.weights, bias: this.bias};
    }

    setGenome(gene) {
        if (_.isObject(gene)) {
            if (_.isArray(gene.weights)) {
                if (gene.weights.length == this.props.numOfInputs) this.weights = gene.weights;
                else throw new Error('Gene length does not match weights length');
            }

            if (_.isNumber(gene.bias)) {
                this.bias = gene.bias;
            }

            return;
        }

        throw new Error('Set genome is called with invalid params');
    }

    serializeGenome() {
        const genome = this.getGenome();
        return genome.weights.concat(genome.bias);
    }


    deserializeGenome(gene) {
        if (!_.isArray(gene)) throw new Error('An array of weights + opt_bias must be supplied to deserialize genome');

        if (gene.length == this.props.numOfInputs) {
            if (this.hasBias) console.log('Warning, deserializing a genome without a bias. Is this intentional?'.yellow);
            return this.setGenome({weights: gene});
        }

        if (gene.length == this.props.numOfInputs + 1) {
            return this.setGenome({
                weights: gene.slice(0, gene.length - 1),
                bias: gene.slice(-1)[0]
            });
        }

        throw new Error('DeserializeGenome is called with an invalid array');
    }



    //WIP to be used for back-propagation. This function is yet incomplete. 
    train(errorSignal) {
        this.weights = this.weights.map(weight => {
            // let learningFeedback = errorSignal * this.activation * this.learningRate;
            // return weight + learningFeedback; 
        });
    }


    toString() {
        let bias = this.hasBias ? '|| ' + this.bias.toFixed(this.printPrecision) : '';
        let str = this.weights.map(weight => weight.toFixed(this.printPrecision)).join(', ') + ' ' + bias;
        return `Neuron - ${this.props.numOfInputs} inputs : ${str}`;
    }
}


module.exports = Neuron;
