import React from "react";
import dummyKBM from "../../dummy/kbm.json";
import { FiTrash2, FiEdit2, FiPlusCircle } from "react-icons/fi";
import Link from "../widget/link";
import { Modal } from "../widget/modal";

const kbm = dummyKBM;
export const JadwalList = (props) => {
  console.log({ props });
  const { history, remoteJadwal } = props;
  const thisJadwal = remoteJadwal.list ? remoteJadwal.list : [];
  const handleEdit = (item) => {
    history.push("/jadwal/" + item.id);
  };
  const handleDelete = (item) => {
    remoteJadwal.del(item);
    // let thisArrJadwal = arrJadwal.data.filter(data => data.tempId !== item.tempId)
    // setArrJadwal({ data: thisArrJadwal })
  };
  return(
    {}
  return kbm.map((value) => {
    return value.rombel.map((item, index) => {
      const jadwal = thisJadwal.filter(
        (val) => val.data.kbmId === value.id && val.data.rombelId === item.id
      );
      // console.log({ jadwal, id: value.id })
      return (
        <div className="list media-list" key={index}>
          <div className="item-content">
            <div className="item-inner">
              <div className="item-title-row">
                <div className="item-title">
                  <h1>
                    {value.mapel} {item.nama}
                  </h1>
                </div>
                <div className="item-after item-center">
                  <Link
                    className="item-link"
                    to={`/new/jadwal/${value.id}/${item.id}`}
                  >
                    {/* <span>Tambah</span> */}
                    <FiPlusCircle />
                  </Link>
                </div>
              </div>
              <div className="item-subtitle">
                {jadwal &&
                  jadwal.map((res, index) => {
                    const item = res.data;
                    return (
                      <div key={index}>
                        <span>
                          {item.tanggal} {item.jam} ({item.durasi} menit){" "}
                        </span>
                        <button
                          className="button-transparent"
                          onClick={() => handleEdit(res)}
                        >
                          <FiEdit2 />
                        </button>{" "}
                        <button
                          onClick={() => handleDelete(res)}
                          className="button-transparent"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      );
    });
  });
</Modal>
})
};

export const JadwalForm = (props) => {
  return <div></div>;
};
