export default class Cache {
  constructor() {
    /**
     * The currently cached items
     * @type {Map<string, object>}
     */
    this.items = new Map()
  }
  /**
   * Fetches an item not on the list
   * @param {string} id
   * @abstract
   */
  async fetchItem(id) {
    throw new Error("The specified object does not exist.")
  }
  async get(id) {
    if (this.items.has(id)) return this.items.get(id)
    this.items.add(id, await this.fetchItem(id))
    this.items.get(id)
  }
  /**
   * Adds a object
   * @abstract
   * @param {string} id
   * @param {object} obj
   */
  add(id, obj) {
    throw new Error("This is read-only")
  }
}