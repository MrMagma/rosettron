module.exports = {
    /**
      * Throws an error if a given condition is satisfied
      * @param {bool} condition - The condition to throw an error on
      * @param {string} message - The error message to be thrown
      */
    errif(cond, msg) {
        if (cond) throw msg;
    }
}
