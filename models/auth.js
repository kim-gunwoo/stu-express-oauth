module.exports = {
    isOwner(req, res) {
        if (req.user) {
            return true;
        } else {
            return false;
        }
    },
    statusUI(req, res) {
        var authStatusUI = `<a href="/auth/login">Login</a> | 
            <a href="/auth/register">Register</a> | 
            <a href="/auth/google">Login With Google</a>
            `;
        if (this.isOwner(req, res)) {
            authStatusUI = `${req.user.displayName} | <a href="/auth/logout">logout</a>`;
        }
        return authStatusUI;
    },
};
