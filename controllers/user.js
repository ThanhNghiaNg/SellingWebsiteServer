exports.getUserInfomation = (req, res, next) =>{
    return res.send({...req.session.user, password: ""})
}