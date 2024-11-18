class API::V1::EventPicturesController < ApplicationController
  include ImageProcessing

  respond_to :json
  before_action :set_event_picture, only: [:show, :update, :destroy]

  def index
    @event_pictures = EventPicture.includes(:user, :event).where(user_id: friend_ids).order(created_at: :desc)
    render json: @event_pictures.map { |picture| picture.as_json.merge(picture_url: url_for(picture.picture), user_handle: picture.user.handle) }, status: :ok
  end

  def show
    if @event_picture.picture.attached?
      render json: {
        event_picture: @event_picture.as_json.merge({
          picture_url: url_for(@event_picture.picture)
        }),
        tags: @event_picture.tags.as_json(include: [:tagged_by, :tagged_user]),
        user: @event_picture.user
      }, status: :ok
    else
      render json: {
        event_picture: @event_picture.as_json,
        tags: @event_picture.tags,
        user: @event_picture.user
      }, status: :ok
    end
  end

  def create
    @event_picture = EventPicture.new(event_picture_params.except(:image_base64))

    if event_picture_params[:image_base64]
      decoded_image = decode_image(event_picture_params[:image_base64])
      @event_picture.picture.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
    end

    if @event_picture.save
      event_picture_data = @event_picture.as_json(include: [:user, :event]).merge(
        type: 'event_picture',
        picture_url: @event_picture.picture.attached? ? url_for(@event_picture.picture) : nil
      )
      ActionCable.server.broadcast('feed_channel', event_picture_data)
      render json: @event_picture, status: :created
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end

  end

  def update
    if event_picture_params[:image_base64]
      decoded_image = decode_image(event_picture_params[:image_base64])
      @event_picture.picture.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
    end

    if @event_picture.update(event_picture_params.except(:image_base64))
      render json: { event_picture: @event_picture, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @event_picture.destroy
      render json: { message: 'Event Picture successfully deleted.' }, status: :no_content
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  private

  def set_event_picture
    @event_picture = EventPicture.find_by(id: params[:id])
  end

  def event_picture_params
    params.require(:event_picture).permit(:user_id, :event_id, :description, :image_base64)
  end

  def decode_image(base64_image)
    decoded_data = Base64.decode64(base64_image)
    io = StringIO.new(decoded_data)
    { io: io, filename: "upload.jpg", content_type: "image/jpeg" }
  end
end
