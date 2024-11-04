class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_event, only: [:show, :update, :destroy, :event_pictures]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  def index
    @events = Event.includes(:bar).all
    render json: {
      events: @events.map { |event|
        event.as_json.merge({
          bar_name: event.bar.name
        })
      }
    }, status: :ok
  end

  # GET /events/:id
  def show
    if @event.flyer.attached?
      render json: @event.as_json.merge({
        image_url: url_for(@event.flyer),
        thumbnail_url: url_for(@event.thumbnail),
        bar_name: @event.bar.name
      }), status: :ok
    else
      render json: @event.as_json.merge({
        bar_name: @event.bar.name
      }), status: :ok
    end
  end

  def create
    @event = Event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'Event created successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @event.destroy
      render json: { message: 'Event successfully deleted.' }, status: :no_content
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  def attendances
    @event = Event.find(params[:id])
    @attendances = @event.attendances.includes(:user)  # Incluir la relación con los usuarios

    render json: {
      attendances: @attendances.map { |attendance|
        attendance.as_json.merge({
          user: {
            id: attendance.user.id,
            name: attendance.user.handle,
            first_name: attendance.user.first_name,
            last_name: attendance.user.last_name
            # Agrega otros atributos del usuario que quieras incluir
          }
        })
      }
    }, status: :ok
  end

  def event_pictures
    @event_pictures = @event.event_pictures
    render json: {
      pictures: @event_pictures.map { |picture|
      puts "Picture ID: #{picture.id}"
      picture.as_json.merge(picture_id: picture.id, picture_url: url_for(picture.picture))
    }
    }, status: :ok
  end

  def create_video
    @event_pictures = EventPicture.where(event_id: params[:event_id])
    @picture_urls = @event_pictures.map { |picture| url_for(picture.picture) }
    if @event_pictures.empty?
      render json: { video_created: false, message: 'No pictures found for this event.' }
    else
      Dir.mktmpdir do |dir|
        download_images(@picture_urls, dir)
        video_path = create_video_from_images(dir)
        send_file video_path, type: 'video/mp4', disposition: 'attachment'
        File.delete(video_path) if File.exist?(video_path)
      end
      render json: { video_created: true, message: 'Creando video' }
    end
  end

  def video_exists
    video_path = Rails.root.join('public', 'videos', "event_#{params[:event_id]}.mp4")
    if File.exist?(video_path)
      render json: { video_url: url_for(video_path), message: "video found" }, status: :ok
    else
      render json: { video_exists: false, message: "video not found" }, status: :ok
    end
  end

  private

  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'Event not found' }, status: :not_found unless @event
  end

  def event_params
    params.require(:event).permit(:name, :description, :date, :bar_id, :start_date, :end_date, :image_base64)
  end

  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.flyer.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
  end

  def set_event_picture
    @event_picture = EventPicture.find_by(id: params[:id])
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

  def download_images(picture_urls, dir)
    picture_urls.each_with_index do |url, index|
      open(url) do |image|
        File.open("#{dir}/image#{index}.jpg", "wb") do |file|
          file.write(image.read)
        end
      end
    end
  end

  def create_video_from_images(dir)
    video_path = Rails.root.join('public', 'videos', "event_#{params[:event_id]}.mp4")
    system("ffmpeg -framerate 1/3 -pattern_type glob -i '#{dir}/*.jpg' -c:v libx264 #{video_path}")
    video_path
  end
end
