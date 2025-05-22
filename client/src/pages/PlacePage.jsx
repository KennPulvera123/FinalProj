import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../axios";
import BookingWidget from "../BookingWidget"; 

export default function PlacePage() {
  const { id } = useParams();
  const [place, setPlace] = useState(null);

  useEffect(() => {
    api.get(`/places/${id}`)
      .then(response => setPlace(response.data))
      .catch(error => console.error('Error fetching place:', error));
  }, [id]);

  if (!place) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{place.title}</h1>
      <div className="text-gray-600 mb-4">{place.address}</div>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            {place.photos?.map((photo, idx) => (
              <img
                key={idx}
                src={`http://localhost:5002/uploads/${photo}`}
                alt={`Photo ${idx + 1}`}
                className="w-full rounded-xl object-cover"
              />
            ))}
          </div>
          <p className="mb-2">{place.description}</p>
          <div>
            <h2 className="text-lg font-semibold mb-1">Perks:</h2>
            <ul className="list-disc pl-6">
              {place.perks && place.perks.length > 0 ? place.perks.map((perk, i) => (
                <li key={i}>{perk}</li>
              )) : <li>No perks listed</li>}
            </ul>
          </div>
        </div>
        {/* Booking Widget */}
        <div className="w-full md:w-80">
          <BookingWidget place={place} />
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-1">Extra Info</h2>
        <p>{place.extraInfo}</p>
      </div>
    </div>
  );
}
