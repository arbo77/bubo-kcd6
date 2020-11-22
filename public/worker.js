importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"
);
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment-with-locales.min.js"
);
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/dexie/3.0.3/dexie.min.js"
);
importScripts(
  "https://cdn.jsdelivr.net/npm/dexie-observable@3.0.0-beta.10/dist/dexie-observable.min.js"
);
importScripts(
  "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.0/axios.min.js"
);

const Bubo = axios.create({
  baseURL: "https://api.bubo.id",
  headers: {
    "Content-Type": "application/json",
    Authorization:
      "Bearer AG8BCncaaB87gxICZMADlCFE7oHbhYjUHvHvDKVxZ4bu95koAHj3Ir_TPaeooFDDPLHtHkhbdGfIxSkA_BO860PfAEtUu1e0E0jVTMQd5ZgFcWEcBvtK8g1P5ToqBKoEecAYsyYNcIOUT9f08w0GCRy-ejU57pqbttu1XS8K9cTuIwWGVxRL1H-WBIrPuVP1BhMHR4Ms6ZyGRHZFfXJWc07nbHXzjNRGGGGAo9xFW0TClWF1mkoqbO_xHPC5LBwcN05CyZ27KL_Hj6Y2FU7XFMHlo9SSZE3Vc9Zk_wLKmOSF1NKidXGM6cXgUqCZKqCebDU4wITDwretOkEj87wECN6xqj3z1L2JIhvlMru_bcioG0jNEnrM9-eoYKfk8xDLmU0NkDfrBMyOFT96nQY3NCWaaPiG3oImxw"
  }
});

const db = new Dexie("bubodex");
db.version(1).stores({
  objects: "++, &id, type",
  pending: "++, ts, event"
});
const objects = db.table("objects");
const pending = db.table("pending");
const method = ["", "put", "patch", "delete"];

const queue = (data, cause, event) => {
  pending.add({
    data: data,
    ts: new Date().getTime(),
    cause: cause,
    event: method[event]
  });
};

const BroadCast = (change) => {
  postMessage({
    channel: change.obj.id,
    item: change.obj
  });
  docs.list({
    data: change.obj,
    channel: (change.oldObj || change.obj).type
  });
};

db.on("changes", function (changes) {
  console.log({ changes });
  changes.forEach(function (change) {
    if (change.table !== "objects") return;
    switch (change.type) {
      case 1:
        BroadCast(change);
        console.log(change.mods);
        // if (change.mods?.id?.toString().length !== 13) { // temp id
        // 	break;
        // }
        // Bubo.put('/', change.obj)
        // 	.then(resp => resp.data)
        // 	.then(resp => {
        // 		objects.update(change.key, resp)
        // 	})
        // 	.catch(ex => {
        // 		queue(change, ex, change.type)
        // 	})
        break;
      case 2:
        BroadCast(change);
        if (change.mods?.id?.toString().length === 13) {
          // temp id
          break;
        }
        console.log(change.mods);
        break;
      case 3:
        console.log("An object was deleted: " + JSON.stringify(change.oldObj));
        break;
    }
  });
});
db.open();

const docs = {
  list: ({ data, channel }) => {
    objects
      .where({ type: data.type })
      .toArray()
      .then((result) => {
        postMessage({
          channel: channel,
          data: result
        });
      });
    Bubo.get(`/${channel}`)
      .then((resp) => resp.data)
      .then((resp) => {
        if (resp.length) {
          resp.forEach((item) => {
            if (item.id !== undefined) {
              objects
                .add({
                  ...item,
                  type: channel
                })
                .catch((ex) => {});
            }
          });
          postMessage({
            channel: channel,
            data: resp
          });
        }
      });
  },
  get: async ({ data, channel }) => {
    const opt = typeof data !== "object" ? { id: data } : { id: data?.id };
    objects.get(opt, (result) => {
      postMessage({
        channel: channel,
        item: result
      });
    });
  },
  put: async ({ data }) => {
    let newId = new Date().getTime();
    objects.add({
      ...data,
      id: newId
    });
    const key = await objects.where({ id: newId }).primaryKeys();
    console.log({ data });
    Bubo.put("/", data)
      .then((resp) => resp.data)
      .then((resp) => {
        objects.update(key[0], resp);
      })
      .catch((ex) => {
        // queue(change, ex, change.type);
      });
  },
  patch: async ({ data }) => {
    console.log(data);
    const key = await objects.where({ id: data.id }).primaryKeys();
    objects.update(key[0], data);
    Bubo.patch(`/${data.id}`, data)
      .then(() => {
        BroadCast(data);
      })
      .catch((ex) => {
        // queue(data, ex, data.type);
      });
  },
  del: ({ data, channel }) => {}
};

self.onmessage = (msg) => {
  if (!msg.isTrusted) return;
  const { action } = msg.data;
  docs[action](msg.data);
};
