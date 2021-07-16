const Bootcamp = require('../models/Bootcamp')

exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.find()
        res.status(200).json({
            success: true,
            count:bootcamp.length,
            message: 'list of all the available bootcamps',
            data: bootcamp
        })
    } catch (err) {
        res.status(500).json({
            success: false
        })
    }
}

exports.getBootcamp = async (req, res, next) => {
    try {
        const id = req.params.id
        const bootcamp = await Bootcamp.findById(id)

        if (!bootcamp) {
            return res.status(404).json({ success: false, message: 'Could not find bootcamp with this id', data: null })
        }

        res.status(200).json({
            success: true,
            message: 'Bootcamp fetched succesfully',
            data: bootcamp
        })
    } catch (err) {
        res.status(400).json({ success: false })
    }
}

exports.createBootcamps = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success: true,
            message: 'bootcamp created',
            data: bootcamp
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message
        })
    }

}

exports.updateBootcamp = async (req, res, next) => {
    try {
        const id = req.params.id
        const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true
        })

        if (!bootcamp) {
            return res.status(404).json({ success: false })
        }

        res.status(200).json({ 
            sucess: true,
            message: 'Bootcamp updated successfully',
            data: bootcamp })
    } catch (err) {
        res.status(500).json({ success: false })
    }

}

exports.deleteBootcamp = async (req, res, next) => {
    try {
        const id = req.params.id
        const bootcamp = await Bootcamp.findByIdAndDelete(id)

        if (!bootcamp) {
            return res.status(404).json({ success: false })
        }
        res.status(200).json({ 
            success: true,
            message: 'Bootcamp deleted successfully',
            data: [] 
        })
    } catch (err) {
        res.status(500).json({ success: false })
    }
}