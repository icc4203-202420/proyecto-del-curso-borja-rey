class API::V1::EventPicturesController < ApplicationController
  include ImageProcessing

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy]

  def index
    @event_pictures = EventPicture.where(event_id: params[:event_id])
    render json: @event_pictures.map { |picture| picture.as_json.merge(picture_url: url_for(picture.picture)) }, status: :ok
  end

  # GET /events/:id
  def show
    if @event_picture.picture.attached?
      render json: @event_picture.as_json.merge({
        image_url: url_for(@event_picture.picture),
        thumbnail_url: url_for(@event_picture.thumbnail),
        bar_name: @event_picture.bar.name
      }), status: :ok
    else
      render json: @event_picture.as_json.merge({
        bar_name: @event_picture.bar.name
      }), status: :ok
    end
  end

  def create
    @event_picture = EventPicture.new(event_picture_params.except(:image_base64))
    handle_image_attachment if event_picture_params[:image_base64]

    if @event_picture.save
      render json: { event_picture: @event_picture, message: 'Event created successfully.' }, status: :ok
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_picture_params[:image_base64]

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
    render json: { error: 'Event Picture not found' }, status: :not_found unless @event
  end

  def event_picture_params
    params.require(:event_picture).permit(:user_id, :event_id, :description, :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(event_picture_params[:image_base64])
    @event_picture.picture.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
  end
  def decode_image(base64_image)
    decoded_data = Base64.decode64(base64_image)
    io = StringIO.new(decoded_data)
    { io: io, filename: "upload.jpg", content_type: "image/jpeg" }
  end
end
