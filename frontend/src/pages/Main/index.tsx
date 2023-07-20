import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./style.css";
import RoomsList from "../../components/RoomsList";
import ChatBox from "../../components/ChatBox";
import Profile from "../../components/Profile";
import RoomMaker from "../../components/RoomMaker";
interface MainProps {
  token: string;
}
export interface ProfileData {
  _id: string;
  fullname: string;
  avatar: string;
  bio: string;
  isOnline: boolean;
  rooms: string[];
  invitations: string[];
}

export const getProfile = (token: string): Promise<any> => {
  return fetch("/api/v1/users/", {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: "Bearer " + token,
    },
  }).then((response) => {
    if (response.ok) {
      return response.json();
    }
    if (response.status == 401) {
      alert("Token expired");
      sessionStorage.removeItem("token");
      window.location.reload();
    }
    throw new Error("Failed to fetch user profile");
  });
};

const Main: FC<MainProps> = ({ token }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [roomsInfo, setRoomsInfo] = useState<any[]>([]);
  const [currentRoomIndex, setCurrentRoomIndex] = useState<number>(0);
  const navigate = useNavigate();
  const handleReFreshProfile = async () => {
    try {
      const newData = await getProfile(token);
      setProfileData(newData);
    } catch (err) {
      navigate("/auth");
    }
  };
  const handleRoomChange = (index: number) => {
    setCurrentRoomIndex(index);
  };
  const handleUpdate = (rooms: any) => {
    setRoomsInfo(rooms);
  };

  useEffect(() => {
    if (token) {
      getProfile(token)
        .then((data: any) => {
          setProfileData(data);
        })
        .catch((error) => {
          console.error(error);
          navigate("/auth");
        });
    }
  }, [token]);

  return (
    <div id="main-page" className="flex">
      {profileData ? (
        <>
          <div className="container">
            <section id="section-left">
              <Profile
                token={token}
                profileData={profileData}
                onRefresh={handleReFreshProfile}
              />
              <RoomMaker token={token} />
              <RoomsList
                userId={profileData._id}
                currentRoomIndex={currentRoomIndex}
                token={token}
                onRoomChange={handleRoomChange}
                onUpdateStatus={handleUpdate}
              />
            </section>
            <section id="section-right">
              {roomsInfo.length > 0 && (
                <ChatBox
                  profile={profileData}
                  token={token}
                  room={roomsInfo[currentRoomIndex]}
                />
              )}
              <img id="chat-bg" src="/assets/img/img_new/pattern.png" />

            </section>
          </div>
        </>
      ) : (
        <div>Loading skeleton ...</div>
      )}
    </div>
  );
};

export default Main;
