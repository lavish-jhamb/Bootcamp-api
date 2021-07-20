const advancedResults = (model,populate) => async (req,res,next) => {
    let query
    const reqQuery = {...req.query}

    // Field To exculde
    const removeField = ['select','sort','page','limit']

    // Loop over remove fields and delete them from req query
    removeField.forEach(params => delete reqQuery[params])

    // Create operators (gt ,gte, lt, lte,in) 
    let queryString = JSON.stringify(reqQuery)
    queryString = queryString.replace(/\b(gt|gte|lt|lte|in)\b/g, match =>`$${match}`)

    // Findind Resources
    query = model.find(JSON.parse(queryString))

    // Select Fields
    if(req.query.select){
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }

    // Sort
    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ')
        query= query.sort(sortBy)
    }else{
        query = query.sort('-createdAt')
    }

    // Pagination
    const page = parseInt(req.query.page,10) || 1
    const limit = parseInt(req.query.limit,10) || 100
    const startIndex = (page - 1) * limit
    const lastIndex = page * limit
    const total = await model.countDocuments()

    query = query.skip(startIndex).limit(limit)

    if(populate) {
        query = query.populate(populate)
    }

    // Executing Query
    const result = await query

    // Pagination result
    const pagination = {}

    if(lastIndex < total){
        pagination.next = {
            page:page + 1,
            limit
        }
    }

    if(startIndex > 0){
        pagination.prev = {
            page:page - 1,
            limit
        }
    }

    res.advancedResults = {
        sucess:true,
        count:result.length,
        pagination,
        data:result
    }

    next()
}

module.exports = advancedResults