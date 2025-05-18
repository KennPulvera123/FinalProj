import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import api from "../axios";  // ✅ Use configured axios instance

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    api.get('/user-places').then(({ data }) => {
      setPlaces(data);
    }).catch((error) => {
      console.error('❌ Failed to fetch user places:', error.response?.data || error.message);
    });
  }, []);

  return (
    <div>
      <AccountNav />
      <div className="text-center">
        <Link
          className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
          to={'/account/places/new'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
          </svg>
          Add new place
        </Link>
      </div>
      <div className="mt-4">
        {places.length > 0 && places.map(place => (
          <Link key={place._id} to={'/account/places/' + place._id} className="flex flex-col md:flex-row cursor-pointer gap-4 bg-gray-100 p-4 rounded-2xl">
            <div className="flex gap-2 grow shrink-0 flex-wrap">
              {place.photos?.length > 0 && place.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`http://localhost:5002/uploads/${photo}`}
                  alt={`Place photo ${index + 1}`}
                  className="object-cover w-24 h-24 rounded-2xl"
                />
              ))}
            </div>
            <div className="grow-0 shrink">
              <h2 className="text-xl">{place.title}</h2>
              <p className="text-sm mt-2">{place.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
