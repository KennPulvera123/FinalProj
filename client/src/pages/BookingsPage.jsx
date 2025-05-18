import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import api from "../axios";
import { Link } from "react-router-dom";
import BookingDates from "../BookingDates";

function PlaceImg({ place }) {
  if (!place?.photos?.length)
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500">
        No Photo
      </div>
    );
  return (
    <img
      src={`http://localhost:5002/uploads/${place.photos[0]}`}
      alt={place.title || "No photo available"}
      className="object-cover w-full h-full"
    />
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api
      .get("/bookings")
      .then((response) => {
        setBookings(response.data);
      })
      .catch((error) => {
        console.error(
          "❌ Error fetching bookings:",
          error.response?.data || error.message
        );
      });
  }, []);

  return (
    <div>
      <AccountNav />
      <div>
        {bookings?.length > 0 ? (
          bookings.map((booking) => (
            <Link
              key={booking._id}
              to={`/account/bookings/${booking._id}`}
              className="flex gap-4 bg-gray-200 rounded-2xl overflow-hidden mb-4"
            >
              <div className="w-48 h-32 flex-shrink-0 overflow-hidden bg-gray-300 rounded-l-2xl">
                <PlaceImg place={booking.place} />
              </div>
              <div className="py-3 pr-3 grow">
                <h2 className="text-xl">{booking.place?.title || "No title"}</h2>
                {/* Optional: Address */}
                {/* <p className="text-gray-500 text-sm">{booking.place?.address}</p> */}
                <BookingDates
                  booking={booking}
                  className="mb-2 mt-4 text-gray-500"
                />
                <div className="flex gap-1 items-center mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
                    />
                  </svg>
                  <span className="text-2xl">Total price: ${booking.price}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">No bookings found.</div>
        )}
      </div>
    </div>
  );
}
