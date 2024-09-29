Rails.application.routes.draw do
  devise_for :users, path: '', path_names: {
    sign_in: 'api/v1/login',
    sign_out: 'api/v1/logout',
    registration: 'api/v1/signup'
  },
  controllers: {
    sessions: 'api/v1/sessions',
    registrations: 'api/v1/registrations'
  }

  devise_scope :user do
    get 'api/v1/sessions', to: 'api/v1/sessions#show'
  end

  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api, defaults: { format: :json } do
    namespace :v1 do
      resources :bars do
        member do
          get 'events', to: 'bars#events'
        end
      end
      resources :events do
        member do
          get 'attendances', to: 'events#attendances'
          get 'event_pictures', to: 'events#event_pictures'
        end
      end
      resources :beers do
        member do
          get 'bars', to: 'beers#bars'
          get 'reviews', to: 'beers#reviews'
        end
      end
      resources :users do
        member do
          get 'friendships'
          post 'friendships', to: 'users#create_friendship'
        end
        resources :reviews, only: [:index]
      end
      resources :attendances
      resources :addresses
      resources :countries
      resources :reviews
      resources :event_pictures
    end
  end
end
