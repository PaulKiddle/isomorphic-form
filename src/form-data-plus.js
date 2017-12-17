export default FormData =>
  class extends FormData {
    static fromString(string) {
      const fd = new this();

      const fields = string
        .replace(/^\?/, "")
        .split("&")
        .map(seg => seg.split("=").map(decodeURIComponent));

      fields.forEach(([key, value]) => {
        fd.append(key, value);
      });

      return fd;
    }

    constructor(form) {
      super(form);
    }

    toJSON(fd) {
      return Array.from(this.entries());
    }

    toString(fd) {
      return (
        "?" +
        this.toJSON()
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
          .join("&")
      );
    }
  };
