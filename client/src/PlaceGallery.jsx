import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "./axios";  

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    api.get('/user-places')
      .then(response => setPlaces(response.data))
      .catch(error => console.error('Error fetching places:', error));
  }, []);

  return (
    <div>
      <div className="text-center">
        <Link
          className="inline-flex gap-1 bg-primary text-white py-2 px-6 rounded-full"
          to={'/account/places/new'}
        >
          + Add new place
        </Link>
      </div>

      <div className="mt-4">
        {places.length > 0 && places.map(place => (
          <Link to={`/account/places/${place._id}`} key={place._id} className="flex gap-4 bg-gray-100 rounded-2xl overflow-hidden mb-4">
            <div className="w-48">
              {place.photos?.[0] && (
                <img
                  src={`http://localhost:5002/uploads/${place.photos[0]}`}
                  alt="Place preview"
                  className="object-cover w-full h-full"
                />
              )}
            </div>
            <div className="grow shrink-0">
              <h2 className="text-xl">{place.title}</h2>
              <p className="text-sm mt-2">{place.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
