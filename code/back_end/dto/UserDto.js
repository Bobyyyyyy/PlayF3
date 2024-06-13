
module.exports = class UserDto {
    #id;
    #name;
    #password;
    #registration_timestamp;
    #rating;

    constructor(document = null) {
        this.#id = null;
        this.#name = null;
        this.#password = null;
        this.#registration_timestamp = null;
        if(document !== null){
            this.#id = document.id;
            this.#name = document.name;
            this.#password = document.password;
            this.#registration_timestamp = document.registration_timestamp;
            this.#rating = document.rating;
        }
    }

    getDocument(){
        return {
            id : this.#id,
            name: this.#name,
            password: this.#password,
            registration_timestamp: this.#registration_timestamp,
            rating: this.#rating
        }
    }

    /**
     * @returns {UserDto}
     * Returns new instance of UserDto with same data
     */
    clone(){
        return new UserDto(this.getDocument());
    }


    /**
     * @param {number} value
     */
    set id(value) {
        this.#id = value;
    }


    /**
     * @param {String} value
     */

    set name(value) {
        this.#name = value;
    }


    /**
     * @param {String} value
     */

    set password(value) {
        this.#password = value;
    }

    /**
     * @param {Date} value
     */

    set registration_timestamp(value) {
        this.#registration_timestamp = value;
    }

    /**
     * @param value
     * @constructor
     */

    set Rating(value) {
        this.#rating = value;
    }


    /**
     * @return {Number|null}
     */
    get id() {
        return this.#id;
    }

    /**
     * @returns {String|null}
     */
    get name() {
        return this.#name;
    }

    /**
     * @returns {String|null}
     */

    get password() {
        return this.#password;
    }

    get Rating() {
        return this.#rating;
    }

    /**
     * @returns {Date|null}
     */
    get registration_timestamp() {
        return this.#registration_timestamp;
    }
}