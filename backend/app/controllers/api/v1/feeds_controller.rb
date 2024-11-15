# app/controllers/api/v1/feeds_controller.rb
class API::V1::FeedsController < ApplicationController
  def index
    user_id = request.headers['User-ID']
    current_user = User.find_by(id: user_id)

    if current_user
      friend_ids = current_user.friends.pluck(:id)
      event_pictures = EventPicture.includes(:user, :event).where(user_id: friend_ids).order(created_at: :desc)
      reviews = Review.includes(:user, :beer).where(user_id: friend_ids).order(created_at: :desc)
      feed_items = (event_pictures + reviews).sort_by(&:created_at).reverse
      render json: feed_items.map { |item|
        if item.is_a?(EventPicture)
          item.as_json.merge(picture_url: url_for(item.picture), user_handle: item.user.handle)
        else
          bar = item.beer.bars.first
          global_rating = item.beer.reviews.average(:rating).to_f.round(2)
          if bar
            item.as_json.merge(
              user_handle: item.user.handle,
              beer_name: item.beer.name,
              bar_name: bar.name,
              bar_country: bar.country,
              bar_address: bar.address,
              bar_id: bar.id,
              global_rating: global_rating,
              created_at: item.created_at.strftime("%Y-%m-%d %H:%M:%S")
            )
          else
            item.as_json.merge(
              user_handle: item.user.handle,
              beer_name: item.beer.name,
              bar_name: 'N/A',
              bar_country: 'N/A',
              bar_address: 'N/A',
              bar_id: nil,
              global_rating: global_rating,
              created_at: item.created_at.strftime("%Y-%m-%d %H:%M:%S")
            )
          end
        end
      }, status: :ok
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end
end
