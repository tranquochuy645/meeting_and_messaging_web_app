import { FC, memo, useState, useEffect, useRef } from "react";
import { ProfileData } from "../../pages/Main";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../SocketProvider";
import { deleteAccount } from "../../lib/deleteAccount";
import FileInput from "../FileInput";
import { getPresignedPost, postFile } from "../../lib/uploadFile";
import "./style.css";

interface ProfileProps {
  token: string;
  profileData: ProfileData | null;
  onRefresh: () => void;
}
interface Invitation {
  _id: string;
  invitor: {
    fullname: string;
    avatar: string;
  };
  type: string;
}

const getInvitations = async (token: string) => {
  try {
    const res = await fetch(
      'api/v1/users/invitations',
      {
        headers: {
          "content-type": "application/json",
          authorization: "Bearer " + token
        }
      }
    )
    const invs = await res.json()
    return invs
  } catch (e) {
    console.error(e)
  }
}
const Profile: FC<ProfileProps> = ({ token, profileData, onRefresh }) => {
  const [showInvitation, setShowInvitation] = useState<boolean>(false);
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);
  const [invitations, setInvitations] = useState<Invitation[] | null>(null)
  const avatarUrlRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const socket = useSocket()
  useEffect(() => {
    if (token) {
      getInvitations(token).then(
        (data) => setInvitations(data)
      )
    }
  }, [token])
  useEffect(() => {
    const refreshInvs = () => {
      if (token) {
        getInvitations(token).then(
          (data) => setInvitations(data)
        )
      }
    }
    if (socket) {
      socket.on("inv", refreshInvs);
      return () => {
        socket.off("inv", refreshInvs);
      }
    }
  }, [socket]);


  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/auth");
  };

  const handleAcceptInvitation = (invitationId: string) => {
    fetch(`/api/v1/rooms/${invitationId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        action: 'join',
      }),
    });
  };

  const handleRefuseInvitation = (invitationId: string) => {
    fetch(`/api/v1/rooms/${invitationId}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        action: 'refuse',
      }),
    });
  };
  const handleSubmit = async () => {
    if (!formRef.current) return;
    let body: any = {};
    if (formRef.current.bio.value) {
      body.bio = formRef.current.bio.value;
    }
    if (formRef.current.fullname.value) {
      body.fullname = formRef.current.fullname.value;
    }
    if (formRef.current.password.value) {
      body.password = formRef.current.password.value;
      if (formRef.current.current_password.value) {
        body.current_password = formRef.current.current_password.value;
      } else {
        return alert("Please enter current password");
      }
    }
    if (avatarUrlRef.current) {
      body.avatar = avatarUrlRef.current;
    }
    if (!body.bio && !body.fullname && !body.password && !body.avatar) {
      return alert("Empty form");
    }
    const response = await fetch(`/api/v1/users/`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    });
    setShowProfileEditor(false);
    if (response.ok) {
      alert("Updated successfully!");
      return onRefresh();
    }
    const data = await response.json();
    if (data.message) {
      return alert(data.message);
    }
    alert("Error updating profile");
  };

  const handleUploadImage = async (file: File) => {
    const url = `media/${profileData?._id}/public/${file.name}`;
    const presignedPost = await getPresignedPost(url, token);
    if (presignedPost && (await postFile(presignedPost, file))) {
      avatarUrlRef.current = url;
      handleSubmit();
    } else {
      alert("Failed to upload image")
    }
  }
  const handleDeleteAccount = async () => {
    try {
      const message = await deleteAccount(token);
      alert(message)
      navigate('/auth')
    } catch (message) {
      alert(message)
    }
  }
  return (
    <div id="profile">
      <div id="profile_topbar">
        <img
          src={profileData?.avatar}
          alt="Profile"
          id="profile_img"
          className="cover"
        />
        {
          showProfileEditor ?
            (
              <FileInput
                accept="image/*"
                onChange={handleUploadImage}
                id="upload-img"
                icon={
                  <i className='bx bxs-camera'></i>
                }
              />
            )
            :
            (<div>
              <h3>{profileData?.fullname}</h3>
              {profileData?.bio && <p>{profileData?.bio}</p>}
            </div>)
        }
        <div className="flex">
          <button className="btn" onClick={() => { setShowInvitation(false); setShowProfileEditor((prev) => !prev) }}>
            {showProfileEditor ? (
              <i className='bx bxs-message-square-x' ></i>
            ) : (
              <i className="bx bxs-pencil"></i>
            )}
          </button>
          <button
            className="btn"
            onClick={() => { setShowProfileEditor(false); setShowInvitation((prev) => !prev) }}
          >
            {showInvitation ? (
              <i className='bx bxs-message-square-x' ></i>
            ) : (
              <div id="bell">
                <i className="bx bxs-bell"></i>
                {invitations && invitations.length &&
                  invitations.length > 0 ? (
                  <span id="nofcount">{invitations.length}</span>
                ) : null}
              </div>
            )}
          </button>
          <button id="logout-btn" className="btn" onClick={handleLogout}>
            <i className="bx bx-log-in"></i>
          </button>
        </div>
      </div>
      <div id="notify-container" className={`profile_dropdown ${showInvitation ? "active" : ""}`}>
        {invitations && invitations.length > 0 ? (
          invitations.map((invitation) => (
            <div key={invitation._id} className="flex invitation">
              {invitation.invitor ?
                <>
                  <img className='profile-picture'
                    alt="IMG"
                    src={invitation.invitor.avatar} />
                  <p>{invitation.invitor.fullname} invited you to a conversation!</p>
                </>
                :
                <p>Invited by anonymous user</p>
              }
              <button className="btn_inv green" onClick={() => handleAcceptInvitation(invitation._id)}>
                Accept
              </button>
              <button className="btn_inv" onClick={() => handleRefuseInvitation(invitation._id)}>
                Refuse
              </button>
            </div>
          ))
        ) : (
          <p>No invitation</p>
        )}
      </div>
      <div className={`profile_dropdown ${showProfileEditor ? "active" : ""}`} id="profile_editor">
        <form id="profile_form" ref={formRef}>
          <div>
            <label htmlFor="fullname">Your name:</label>
            <input type="text" id="fullname" name="fullname" placeholder={profileData?.fullname} />
          </div>
          <div>
            <label htmlFor="bio">Bio:</label>
            <input type="text" id="bio" name="bio" placeholder={profileData?.bio} />
          </div>
          <div>
            <label htmlFor="current_password">Current password:</label>
            <input
              type="password"
              id="current_password"
              name="current_password"
            />
          </div>
          <div>
            <label htmlFor="password">New password:</label>
            <input type="password" id="password" name="password" />
          </div>
        </form>
        <div className="flex">
          <button id="btn_delete-account" onClick={handleDeleteAccount}>Delete account</button>
          <button id="btn_submit-edit" onClick={handleSubmit}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default memo(Profile);
