module.exports = class MatchDto {
    #id;
    #start_timestamp;
    #type;
    #deleted;
    #status;
    #situations;

    constructor(document = null) {
        this.#id = null;
        this.#start_timestamp = null;
        this.#type = null;
        this.#deleted = null;
        this.#status = null;
        this.#situations = null;
        if(document !== null){
            this.#id = document.id;
            this.#start_timestamp = document.start_timestamp;
            this.#type = document.type;
            this.#deleted = document.deleted;
            this.#status = document.status;
            this.#situations = document.situations;
        }
    }

    getDocument(){
        return {
            id : this.#id,
            start_timestamp: this.#start_timestamp,
            type: this.#type,
            deleted: this.#deleted,
            status: this.#status,
            situations: this.#situations,
        }
    }


    /**
     * @param {number} value
     */
    set id(value) {
        this.#id = value;
    }

    /**
     * @param {string} value
     */
    set start_timestamp(value) {
        this.#start_timestamp = value;
    }

    /**
     * @param {string} value
     */
    set type(value) {
        this.#type = value;
    }

    /**
     * @param {number} value
     */
    set deleted(value) {
        this.#deleted = value;
    }

    /**
     * @param {number} value
     */
    set status(value) {
        this.#status = value;
    }

    /**
     * @param {String} value
     */
    set situations(value) {
        this.#situations = value;
    }

    /**
     * @return {number|null}
     */
    get id() {
        return this.#id;
    }

    /**
     * @return {string | null}
     */
    get start_timestamp() {
        return this.#start_timestamp;
    }

    /**
     * @return {string | null}
     */
    get type() {
        return this.#type;
    }

    /**
     * @return {number | null}
     */
    get deleted() {
        return this.#deleted;
    }

    /**
     * @return {number | null}
     */
    get status() {
        return this.#status;
    }


    /**
     * @returns {String|null}
     */
    get situations() {
        return this.#situations;
    }

}
