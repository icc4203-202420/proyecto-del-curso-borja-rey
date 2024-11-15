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
          {
            id: item.id,
            type: 'event_picture',
            picture_url: item.picture.attached? ? url_for(item.picture) : nil,
            user_handle: item.user.handle,
            description: item.description,
            event_id: item.event.id,
            created_at: item.created_at.strftime("%Y-%m-%d %H:%M:%S")
          }
        elsif item.is_a?(Review)
          bar = item.beer.bars.first
          global_rating = item.beer.reviews.average(:rating).to_f.round(2)
          {
            id: item.id,
            type: 'review',
            user_handle: item.user.handle,
            beer_name: item.beer.name,
            rating: item.rating,
            global_rating: global_rating,
            created_at: item.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            bar_name: bar ? bar.name : 'N/A',
            bar_country: bar && bar.address ? Country.find_by(id: bar.address.country_id)&.name || 'N/A' : 'N/A',
            bar_address: bar && bar.address ? format_address(bar.address) : nil,
            bar_id: bar ? bar.id : nil
          }
        end
      }.compact, status: :ok
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  private

  def format_address(address)
    [
      address.line1,
      address.line2,
      address.city,
      address.country_id
    ].compact.join(', ')
  end
end
